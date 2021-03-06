import { CssBaseline } from '@material-ui/core';
import { responsiveFontSizes } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import * as Sentry from '@sentry/react';
import localForage from 'localforage';
import { configure } from 'mobx';
import { enableLogging } from 'mobx-logger';
import { create } from 'mobx-persist';
import moment from 'moment';
import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Redirect, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.min.css';
import ua, { Visitor } from 'universal-analytics';
import './assets/styles/reactour.scss';
import exilenceTheme from './assets/themes/exilence-theme';
import AnnouncementDialogContainer from './components/announcement-dialog/AnnouncementDialogContainer';
import DrawerWrapperContainer from './components/drawer-wrapper/DrawerWrapperContainer';
import ErrorBoundaryFallback from './components/error-boundary-fallback/ErrorBoundaryFallback';
import GlobalStyles from './components/global-styles/GlobalStyles';
import HeaderContainer from './components/header/HeaderContainer';
import HighchartsTheme from './components/highcharts-theme/HighchartsTheme';
import Notifier from './components/notifier/Notifier';
import ReactionContainer from './components/reaction-container/ReactionContainer';
import ToastWrapper from './components/toast-wrapper/ToastWrapper';
import ToolbarContainer from './components/toolbar/ToolbarContainer';
import AppConfig from './config/app.config';
import configureAxios from './config/axios';
import configureI18n from './config/i18n';
import initSentry from './config/sentry';
import useStyles from './index.styles';
import Login from './routes/login/Login';
import NetWorth from './routes/net-worth/NetWorth';
import Settings from './routes/settings/Settings';
import BulkSell from './routes/bulk-sell/BulkSell';
import { electronService } from './services/electron.service';
import { RootStore } from './store/rootStore';

export const appName = 'Exilence Next';
export let visitor: Visitor | undefined = undefined;
initSentry();
configureI18n();
configureAxios();
enableLogging({
  action: false,
  reaction: false,
  transaction: false,
  compute: false,
});

configure({ enforceActions: 'observed' });

moment.locale(electronService.appLocale);

const theme = responsiveFontSizes(exilenceTheme());

export const rootStore = new RootStore();

const RootStoreContext = React.createContext(rootStore);

export function useStores() {
  return React.useContext(RootStoreContext);
}

localForage.config({
  name: 'exilence-next-db',
  driver: localForage.INDEXEDDB,
});

type Props = {
  error?: Error;
};

const App = ({ error }: Props) => {
  const classes = useStyles();
  useEffect(() => {
    const preload = document.getElementById('preload');
    if (preload) preload.remove();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={null}>
        <Router>
          <div className={classes.app}>
            <HighchartsTheme />
            <CssBaseline />
            <GlobalStyles />
            <ToastWrapper />
            <Route path="/login" component={Login} />
            <HeaderContainer />
            {error ? (
              <ErrorBoundaryFallback error={error} componentStack={error.stack ?? null} />
            ) : (
              <Sentry.ErrorBoundary fallback={(props) => <ErrorBoundaryFallback {...props} />}>
                <DrawerWrapperContainer>
                  <ToolbarContainer />
                  <Route path="/net-worth" component={NetWorth} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/bulk-sell" component={BulkSell} />
                  <Route
                    exact
                    path="/"
                    render={() =>
                      rootStore.accountStore.getSelectedAccount.name ? (
                        <Redirect to="/net-worth" />
                      ) : (
                        <Redirect to="/login" />
                      )
                    }
                  />
                </DrawerWrapperContainer>
              </Sentry.ErrorBoundary>
            )}
            <Notifier />
            <ReactionContainer />
            <AnnouncementDialogContainer />
          </div>
        </Router>
      </Suspense>
    </ThemeProvider>
  );
};

const hydrate = create({
  storage: localForage,
  jsonify: true,
});

const renderApp = () => {
  Promise.all([
    hydrate('account', rootStore.accountStore),
    hydrate('customPrice', rootStore.customPriceStore),
    hydrate('uiState', rootStore.uiStateStore),
    hydrate('league', rootStore.leagueStore),
    hydrate('setting', rootStore.settingStore),
  ])
    .then(() => {
      rootStore.settingStore.setUiScale(rootStore.settingStore.uiScale);
      visitor = ua(AppConfig.trackingId, rootStore.uiStateStore.userId);
      ReactDOM.render(<App />, document.getElementById('root'));
    })
    .catch((err: Error) => {
      ReactDOM.render(<App error={err} />, document.getElementById('root'));
    });
};

hydrate('migration', rootStore.migrationStore)
  .then(() => {
    if (rootStore.migrationStore.current < rootStore.migrationStore.latest) {
      rootStore.migrationStore.runMigrations().subscribe(() => renderApp());
    } else {
      renderApp();
    }
  })
  .catch((err: Error) => {
    ReactDOM.render(<App error={err} />, document.getElementById('root'));
  });
