import { ComponentSwapper, SegmentedControl, SelectDropdown } from '@automattic/components';
import { Icon, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight, find, get } from 'lodash';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DatePicker from '../components/stats-date-picker';
import {
	STATS_FEATURE_SUMMARY_LINKS_30_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_7_DAYS,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
	STATS_FEATURE_SUMMARY_LINKS_DAY,
	STATS_FEATURE_SUMMARY_LINKS_QUARTER,
	STATS_FEATURE_SUMMARY_LINKS_YEAR,
} from '../constants';
import { shouldGateStats } from '../hooks/use-should-gate-stats';

import './summary-nav.scss';

export const StatsModuleSummaryLinks = ( props ) => {
	const {
		translate,
		path,
		siteSlug,
		query,
		period,
		hideNavigation,
		navigationSwap,
		shouldGateOptions,
		siteId,
	} = props;

	const dispatch = useDispatch();

	const getSummaryPeriodLabel = () => {
		switch ( period.period ) {
			case 'day':
				return translate( 'Day Summary' );
			case 'week':
				return translate( 'Week Summary' );
			case 'month':
				return translate( 'Month Summary' );
			case 'year':
				return translate( 'Year Summary' );
		}
	};

	const recordStats = ( item ) => {
		props.recordGoogleEvent( 'Stats', `Clicked Summary Link: ${ path } ${ item.stat }` );
	};

	const handleClick = ( item ) => ( event ) => {
		if ( item.isGated ) {
			event.preventDefault();
			dispatch( toggleUpsellModal( siteId, item.statType ) );
		}
		recordStats( item );
	};

	const summaryPath = `/stats/day/${ path }/${ siteSlug }?startDate=${ moment().format(
		'YYYY-MM-DD'
	) }&summarize=1&num=`;
	const summaryPeriodPath = `/stats/${
		period.period
	}/${ path }/${ siteSlug }?startDate=${ period.endOf.format( 'YYYY-MM-DD' ) }`;
	const options = [
		{
			value: '0',
			label: getSummaryPeriodLabel(),
			path: summaryPeriodPath,
			stat: 'Period Summary',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_DAY ],
			statType: STATS_FEATURE_SUMMARY_LINKS_DAY,
		},
		{
			value: '7',
			label: translate( '7 days' ),
			path: `${ summaryPath }7`,
			stat: '7 Days',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_7_DAYS ],
			statType: STATS_FEATURE_SUMMARY_LINKS_7_DAYS,
		},
		{
			value: '30',
			label: translate( '30 days' ),
			path: `${ summaryPath }30`,
			stat: '30 Days',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_30_DAYS ],
			statType: STATS_FEATURE_SUMMARY_LINKS_30_DAYS,
		},
		{
			value: '90',
			label: translate( 'Quarter' ),
			path: `${ summaryPath }90`,
			stat: 'Quarter',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_QUARTER ],
			statType: STATS_FEATURE_SUMMARY_LINKS_QUARTER,
		},
		{
			value: '365',
			label: translate( 'Year' ),
			path: `${ summaryPath }365`,
			stat: 'Year',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_YEAR ],
			statType: STATS_FEATURE_SUMMARY_LINKS_YEAR,
		},
		{
			value: '-1',
			label: translate( 'All Time' ),
			path: `${ summaryPath }-1`,
			stat: 'All Time',
			isGated: shouldGateOptions[ STATS_FEATURE_SUMMARY_LINKS_ALL ],
			statType: STATS_FEATURE_SUMMARY_LINKS_ALL,
		},
	];

	const numberDays = get( query, 'num', '0' );
	const selected = find( options, { value: numberDays } );

	const tabs = (
		<SegmentedControl
			primary
			className={ clsx( 'stats-summary-nav__intervals' ) }
			compact={ false }
		>
			{ options.map( ( i ) => (
				<SegmentedControl.Item
					key={ i.value }
					path={ i.isGated ? '' : i.path }
					selected={ i.value === selected.value }
					onClick={ handleClick( i ) }
				>
					{ i.label }
					{ i.isGated && <Icon icon={ lock } width={ 16 } height={ 16 } /> }
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
	const select = (
		<SelectDropdown
			className="section-nav-tabs__dropdown stats-summary-nav__select"
			selectedText={ selected.label }
		>
			{ options.map( ( i, index ) => (
				<SelectDropdown.Item
					{ ...i }
					key={ 'navTabsDropdown-' + index }
					path={ i.path }
					selected={ i.value === selected.value }
					onClick={ handleClick( i ) }
				>
					{ i.label }
					{ i.isGated && (
						<Icon
							className="stats-summary-nav__gated-icon"
							icon={ lock }
							width={ 16 }
							height={ 16 }
						/>
					) }
				</SelectDropdown.Item>
			) ) }
		</SelectDropdown>
	);

	const navClassName = clsx( 'stats-summary-nav', {
		[ 'stats-summary-nav--with-button' ]: hideNavigation && navigationSwap,
	} );

	return (
		<div className={ navClassName }>
			{ ! hideNavigation && (
				<ComponentSwapper
					className={ clsx( 'stats-summary-nav__intervals-container' ) }
					breakpoint="<660px"
					breakpointActiveComponent={ select }
					breakpointInactiveComponent={ tabs }
				/>
			) }
			<div className="stats-summary-nav__header">
				<DatePicker
					period={ period.period }
					date={ period.startOf }
					path={ path }
					query={ query }
					summary={ false }
				/>
			</div>
			{ hideNavigation && navigationSwap }
		</div>
	);
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const shouldGateOptions = {
			[ STATS_FEATURE_SUMMARY_LINKS_DAY ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_DAY
			),
			[ STATS_FEATURE_SUMMARY_LINKS_7_DAYS ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_7_DAYS
			),
			[ STATS_FEATURE_SUMMARY_LINKS_30_DAYS ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_30_DAYS
			),
			[ STATS_FEATURE_SUMMARY_LINKS_QUARTER ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_QUARTER
			),
			[ STATS_FEATURE_SUMMARY_LINKS_YEAR ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_YEAR
			),
			[ STATS_FEATURE_SUMMARY_LINKS_ALL ]: shouldGateStats(
				state,
				siteId,
				STATS_FEATURE_SUMMARY_LINKS_ALL
			),
		};

		return { siteId, siteSlug, shouldGateOptions };
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsModuleSummaryLinks );
