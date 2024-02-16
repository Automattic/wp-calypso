import i18n from 'i18n-calypso';
import type { Moment } from 'moment';

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'hour';

interface SiteFilterType {
	title: string;
	path: string;
	id: string;
	period?: PeriodType;
	altPaths?: any; // it looks like nothing in the codebase is using the altPaths property but it can come from a URL
}

function rangeOfPeriod( period: PeriodType, date: Moment ) {
	const periodRange = {
		period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period ),
		key: '',
	};

	if ( 'week' === period ) {
		if ( '0' === date.format( 'd' ) ) {
			periodRange.startOf.subtract( 6, 'd' );
			periodRange.endOf.subtract( 6, 'd' );
		} else {
			periodRange.startOf.add( 1, 'd' );
			periodRange.endOf.add( 1, 'd' );
		}
	}

	periodRange.key = period + ':' + periodRange.endOf.format( 'YYYY-MM-DD' );

	return periodRange;
}

function getSiteFilters( siteId: number ): SiteFilterType[] {
	return [
		//TODO: This Insights route could be removed since it has been set routing as below.
		// statsPage( '/stats/insights/:site', insights );
		{
			title: i18n.translate( 'Insights' ),
			path: '/stats/insights/' + siteId,
			id: 'stats-insights',
		},
		{
			title: i18n.translate( 'Subscribers' ),
			path: '/stats/subscribers/' + siteId,
			id: 'stats-subscribers',
			period: 'day', // default period for Subscribers
		},
		{
			title: i18n.translate( 'Days' ),
			path: '/stats/subscribers/day/' + siteId,
			id: 'stats-subscribers-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Weeks' ),
			path: '/stats/subscribers/week/' + siteId,
			id: 'stats-subscribers-week',
			period: 'week',
		},
		{
			title: i18n.translate( 'Months' ),
			path: '/stats/subscribers/month/' + siteId,
			id: 'stats-subscribers-month',
			period: 'month',
		},
		{
			title: i18n.translate( 'Years' ),
			path: '/stats/subscribers/year/' + siteId,
			id: 'stats-subscribers-year',
			period: 'year',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: '/stats/hour/' + siteId,
			id: 'stats-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: '/stats/day/' + siteId,
			id: 'stats-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Weeks' ),
			path: '/stats/week/' + siteId,
			id: 'stats-week',
			period: 'week',
		},
		{
			title: i18n.translate( 'Months' ),
			path: '/stats/month/' + siteId,
			id: 'stats-month',
			period: 'month',
		},
		{
			title: i18n.translate( 'Years' ),
			path: '/stats/year/' + siteId,
			id: 'stats-year',
			period: 'year',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: `/stats/email/opens/hour/`,
			id: 'stats-email-opens-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/email/opens/day/`,
			id: 'stats-email-opens-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: `/stats/email/clicks/hour/`,
			id: 'stats-email-clicks-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/email/clicks/day/`,
			id: 'stats-email-clicks-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/day/emails`,
			id: 'stats-email-summary',
			period: 'day',
		},
	];
}

export { getSiteFilters, rangeOfPeriod, type SiteFilterType };
