import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import StatsModuleCountries from 'calypso/my-sites/stats/features/modules/stats-countries';
import StatsModuleReferrers from 'calypso/my-sites/stats/features/modules/stats-referrers';
import StatsModuleTopPosts from 'calypso/my-sites/stats/features/modules/stats-top-posts';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { requestSiteStats } from 'calypso/state/stats/lists/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PageViewTracker from '../../stats-page-view-tracker';
import statsStrings from '../../stats-strings';
import StatsModuleListing from '../shared/stats-module-listing';
import RealtimeChart from './chart';

import './style.scss';

// TODO: Update header per design review.
// Each page has slightly different headers so staying simple
// and requesting feedback first.
// Not traslating until until design is finalized.
function StatsRealtimeHeader() {
	return (
		<div className="stats-realtime-header">
			<h2 className="stats-realtime-header__title">Current views</h2>
			<div className="stats-realtime-header__description">
				<span>Updates once per minute</span>
			</div>
		</div>
	);
}

function StatsRealtime() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state, siteId ) );
	const momentSiteZone = useSelector( ( state ) => getMomentSiteZone( state, siteId ) );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const moduleStrings = statsStrings();

	const halfWidthModuleClasses = clsx(
		'stats__flexible-grid-item--half',
		'stats__flexible-grid-item--full--large',
		'stats__flexible-grid-item--full--medium'
	);

	// TODO: Determine how query will be set up.
	// Need a period, a query, and a URL to use Top Posts.
	// See getStatHref() example on Traffic page for URL.
	const period = {};
	const url = '#';

	// TODO: Create a new query when the date changes.

	const query = useMemo(
		() => ( {
			period: 'day',
			date: momentSiteZone.format( 'YYYY-MM-DD' ),
			max: 10,
			summarize: 1,
		} ),
		[ momentSiteZone ]
	);

	useEffect( () => {
		// TODO: This array determines which requests are fired.
		// Currently firing two requests but only displaying top posts.
		const statTypes = [ 'statsTopPosts', 'statsReferrers', 'statsCountryViews' ];

		// Function to dispatch the request
		const fetchStats = () => {
			statTypes.forEach( ( statType ) => {
				dispatch( requestSiteStats( siteId, statType, query ) );
			} );
		};

		// Initial fetch, followed by timed fetch.
		fetchStats();
		const intervalInMilliseconds = 15000; // 15 seconds
		const intervalId = setInterval( fetchStats, intervalInMilliseconds );

		// Clear the interval when the component unmounts
		return () => clearInterval( intervalId );
	}, [ dispatch, siteId, query ] );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'realtime' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<PageViewTracker path="/stats/realtime/:site" title="Stats > Realtime" />
			<div className="stats">
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ STATS_PRODUCT_NAME }
					subtitle={ translate( "[Experimental] View your site's traffic in real-time." ) }
					screenReader={ navItems.realtime?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="realtime" siteId={ siteId } slug={ siteSlug } />
				<StatsRealtimeHeader />
				<RealtimeChart siteId={ siteId } />
				<StatsModuleListing className="stats__module-list--insights" siteId={ siteId }>
					<StatsModuleTopPosts
						moduleStrings={ moduleStrings.posts }
						period={ period }
						query={ query }
						summaryUrl={ url }
						className={ halfWidthModuleClasses }
						isRealTime
					/>
					<StatsModuleReferrers
						moduleStrings={ moduleStrings.referrers }
						period={ period }
						query={ query }
						summaryUrl={ url }
						className={ halfWidthModuleClasses }
						isRealTime
					/>
					<StatsModuleCountries
						moduleStrings={ moduleStrings.countries }
						period={ period }
						query={ query }
						summaryUrl={ url }
						className={ clsx( 'stats__flexible-grid-item--full' ) }
						isRealTime
					/>
				</StatsModuleListing>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default StatsRealtime;
