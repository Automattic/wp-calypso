import { recordTracksEvent } from '@automattic/calypso-analytics';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { getShortcuts } from 'calypso/components/date-range/use-shortcuts';
import StatsDateControl from 'calypso/components/stats-date-control';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	DATE_FORMAT,
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_SUMMARY_LINKS_ALL,
} from '../constants';
import { useMomentInSite } from '../hooks/use-moment-site-zone';
import { shouldGateStats } from '../hooks/use-should-gate-stats';
import StatsCardUpsell from '../stats-card-upsell';
import DatePicker from '../stats-date-label';
import { addIsGatedFor } from '../stats-period-navigation';
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
		shortcutList,
		gateDateControl,
		gateAllTimeSummaryLink,
		isSiteJetpackNotAtomic,
		siteId,
		context,
	} = props;

	const dispatch = useDispatch();
	const momentInSite = useMomentInSite( siteId );

	const isAllTime = String( query?.num ) === '-1';
	let chartStart;
	let chartEnd;
	if ( isAllTime ) {
		// "All time" has no bounded range: leave the selection empty so the picker
		// shows no dates (rather than defaulting to today).
		chartStart = undefined;
		chartEnd = undefined;
	} else if ( query?.start_date ) {
		chartStart = query.start_date;
		chartEnd = query.date;
	} else if ( Number( query?.num ) > 0 && query?.summarize ) {
		// Legacy pill-era links (`?num=30&summarize=1`): seed the picker with the
		// actual "N days ending {date}" range the page is summarizing.
		chartEnd = momentInSite( query.date ).format( DATE_FORMAT );
		chartStart = momentInSite( query.date )
			.subtract( Number( query.num ) - 1, 'days' )
			.format( DATE_FORMAT );
	} else {
		// Legacy single-date entry (e.g. default "View details", `?startDate={periodEnd}`) has no
		// custom range: seed the picker from the summarized period instead of an empty range.
		chartStart = period.startOf.format( DATE_FORMAT );
		chartEnd = period.endOf.format( DATE_FORMAT );
	}
	const shortcutId = context.query?.shortcut || ( isAllTime ? 'all_time' : undefined );
	const daysInRange =
		chartStart && chartEnd
			? momentInSite( chartEnd ).diff( momentInSite( chartStart ), 'days' ) + 1
			: 0;
	const dateRange = { chartStart, chartEnd, daysInRange, shortcutId };

	const fullShortcutList = useMemo(
		() => [
			...shortcutList,
			{
				id: 'all_time',
				label: translate( 'All Time' ),
				startDate: '',
				endDate: '',
				period: 'day',
				isGated: gateAllTimeSummaryLink,
				statType: STATS_FEATURE_SUMMARY_LINKS_ALL,
			},
		],
		[ shortcutList, gateAllTimeSummaryLink, translate ]
	);

	const onGatedHandler = ( events, source, statType ) => {
		// Stop the popup from showing for Jetpack sites.
		if ( isSiteJetpackNotAtomic ) {
			return;
		}

		events.forEach( ( event ) => recordTracksEvent( event.name, event.params ) );
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	const navClassName = clsx( 'stats-summary-nav', {
		[ 'stats-summary-nav--with-button' ]: hideNavigation && navigationSwap,
	} );

	return (
		<div className={ navClassName }>
			{ /* The container is row-reversed at wide widths, so the first child renders on the right. */ }
			<div className="stats-summary-nav__date-control">
				<StatsDateControl
					slug={ siteSlug }
					period={ period.period }
					module={ path }
					queryParams={ context.query }
					dateRange={ dateRange }
					shortcutList={ fullShortcutList }
					onGatedHandler={ onGatedHandler }
					overlay={
						gateDateControl && (
							<StatsCardUpsell
								className="stats-module__upsell"
								statType={ STATS_FEATURE_DATE_CONTROL }
								siteId={ siteId }
							/>
						)
					}
				/>
			</div>
			<div className="stats-summary-nav__header">
				<DatePicker
					period={ period.period }
					date={ period.startOf }
					path={ path }
					query={ query }
					dateRange={ dateRange }
					summary={ false }
				/>
			</div>
			{ hideNavigation && navigationSwap }
		</div>
	);
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const { supportedShortcutList } = getShortcuts( state, {} );
	const shortcutList = supportedShortcutList.map( addIsGatedFor( state, siteId ) );

	return {
		siteId,
		siteSlug,
		shortcutList,
		gateDateControl: shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL ),
		gateAllTimeSummaryLink: shouldGateStats( state, siteId, STATS_FEATURE_SUMMARY_LINKS_ALL ),
		isSiteJetpackNotAtomic: isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ),
	};
} );

export default compose( connectComponent, localize )( StatsModuleSummaryLinks );
