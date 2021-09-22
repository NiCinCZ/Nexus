import { Box, Grid, IconButton, Tooltip, Typography } from '@material-ui/core';
import { Clear, SwapHoriz } from '@material-ui/icons';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStores } from '../..';
import { formatValue } from '../../utils/snapshot.utils';
import useStyles from './OverviewWidgetContent.styles';

type OverviewWidgetContentProps = {
  value: number | string;
  valueIsDiff?: boolean;
  valueSuffix?: string;
  secondaryValue?: number | string;
  secondaryValueIsDiff?: boolean;
  secondaryValueStyles?: React.CSSProperties;
  clearFn?: () => void;
  title: string;
  icon: JSX.Element;
  sparklineChart?: JSX.Element;
  valueColor?: string;
  currency?: boolean;
  currencyShort?: string;
  tooltip?: string;
  currencySwitch?: boolean;
};

const OverviewWidgetContent = ({
  icon,
  title,
  value,
  valueIsDiff,
  valueSuffix,
  secondaryValue,
  secondaryValueIsDiff,
  secondaryValueStyles,
  clearFn,
  valueColor,
  currency,
  currencyShort,
  tooltip = '',
  currencySwitch,
  sparklineChart,
}: OverviewWidgetContentProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { settingStore, priceStore } = useStores();
  return (
    <>
      <Grid container className={classes.topContent}>
        <Grid item sm={7}>
          <Grid container spacing={2}>
            <Grid item>{icon}</Grid>
            <Grid item>
              <Box height={1} display="flex" justifyContent="center" alignItems="center">
                {sparklineChart}
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={5}>
          <div className={classes.ellipsis}>
            <Typography variant="h6" align="right" style={{ color: valueColor }}>
              {currency
                ? `${formatValue(
                    value,
                    currencyShort,
                    valueIsDiff,
                    true,
                    !priceStore.exaltedPrice
                  )}`
                : value}
              {currency && currencySwitch && (
                <Tooltip
                  title={
                    <>
                      <Typography variant="subtitle1" color="inherit" gutterBottom>
                        1 ex = {priceStore.exaltedPrice?.toFixed(1)} chaos
                      </Typography>
                      <em>{t('action.currency_switch')}</em>
                    </>
                  }
                  classes={{ tooltip: classes.tooltip }}
                  placement="bottom-end"
                >
                  <IconButton
                    size="small"
                    className={classes.adornmentIcon}
                    onClick={() => settingStore.setShowPriceInExalt(!settingStore.showPriceInExalt)}
                  >
                    <SwapHoriz />
                  </IconButton>
                </Tooltip>
              )}
              <span className={classes.valueSuffix}>{valueSuffix}</span>
              {clearFn && (
                <Tooltip
                  title={`${t('label.reset')}`}
                  classes={{ tooltip: classes.tooltip }}
                  placement="bottom-end"
                >
                  <IconButton size="small" className={classes.adornmentIcon} onClick={clearFn}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
          </div>
        </Grid>
      </Grid>
      <Box mt={1}>
        <Grid container spacing={1}>
          <Grid item sm={6}>
            <Typography component="span" style={{}} className={classes.title}>
              {t(title)}
            </Typography>
          </Grid>
          <Grid item sm={6}>
            <Tooltip title={tooltip} classes={{ tooltip: classes.tooltip }} placement="bottom-end">
              <div className={classes.ellipsis}>
                {secondaryValue && secondaryValueIsDiff ? (
                  <Typography
                    component="span"
                    noWrap
                    style={secondaryValueStyles}
                    className={clsx(classes.secondary, {
                      [classes.currencyChange]: currency,
                      [classes.positiveChange]: secondaryValue > 0,
                      [classes.negativeChange]: secondaryValue < 0,
                    })}
                  >
                    {formatValue(secondaryValue, currencyShort, true)}
                  </Typography>
                ) : (
                  <>
                    <Typography
                      component="span"
                      noWrap
                      style={secondaryValueStyles}
                      className={clsx(classes.secondary, {
                        [classes.currencyChange]: currency,
                      })}
                    >
                      {secondaryValue !== 0 ? secondaryValue : ''}
                    </Typography>
                  </>
                )}
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default observer(OverviewWidgetContent);
