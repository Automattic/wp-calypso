import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import StatsModuleComments from 'calypso/my-sites/stats/features/modules/stats-comments';
import StatShares from 'calypso/my-sites/stats/features/modules/stats-shares';
import StatsModuleTags from 'calypso/my-sites/stats/features/modules/stats-tags';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { STATS_PLAN_USAGE_RECEIVE } from 'calypso/state/action-types';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AllTimeHighlightsSection from '../../sections/all-time-highlights-section';
import AllTimeViewsSection from '../../sections/all-time-views-section';
import AnnualHighlightsSection from '../../sections/annual-highlights-section';
import PostingActivity from '../../sections/posting-activity-section';
import StatsModule from '../../stats-module';
import PageViewTracker from '../../stats-page-view-tracker';
import statsStrings from '../../stats-strings';

const StatsInsights = ( props ) => {
	const { siteId, siteSlug, isOdysseyStats, isJetpack } = props;
	const translate = useTranslate();
	const moduleStrings = statsStrings();
	const isEmptyStateV2 = config.isEnabled( 'stats/empty-module-v2' );
	const { isPending, data: usageInfo } = usePlanUsageQuery( siteId );
	const reduxDispatch = useDispatch();

	// Dispatch the plan usage data to the Redux store for monthly views check in shouldGateStats.
	useEffect( () => {
		if ( ! isPending ) {
			reduxDispatch( {
				type: STATS_PLAN_USAGE_RECEIVE,
				siteId,
				data: usageInfo,
			} );
		}
	}, [ reduxDispatch, isPending, siteId, usageInfo ] );

	const statsModuleListClass = clsx(
		'stats__module-list--insights',
		'stats__module--unified',
		'stats__module-list',
		'stats__flexible-grid-container',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		}
	);

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'insights' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/insights/:site" title="Stats > Insights" />
			<div className="stats">
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate( "View your site's performance and learn from trends." ) }
					screenReader={ navItems.insights?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="insights" siteId={ siteId } slug={ siteSlug } />
				<AnnualHighlightsSection siteId={ siteId } />
				<AllTimeHighlightsSection siteId={ siteId } siteSlug={ siteSlug } />
				<PostingActivity siteId={ siteId } />
				<AllTimeViewsSection siteId={ siteId } slug={ siteSlug } />
				<div className={ statsModuleListClass }>
					{ isEmptyStateV2 && (
						<StatsModuleTags
							moduleStrings={ moduleStrings.tags }
							hideSummaryLink
							className={ clsx(
								{
									'stats__flexible-grid-item--half': isJetpack,
									'stats__flexible-grid-item--full--large': isJetpack,
								},
								{
									'stats__flexible-grid-item--full': ! isJetpack,
								}
							) }
						/>
					) }
					{ ! isEmptyStateV2 && (
						<StatsModule
							path="tags-categories"
							moduleStrings={ moduleStrings.tags }
							statType="statsTags"
							hideSummaryLink
							className={ clsx(
								{
									'stats__flexible-grid-item--half': isJetpack,
									'stats__flexible-grid-item--full--large': isJetpack,
								},
								{
									'stats__flexible-grid-item--full': ! isJetpack,
								}
							) }
						/>
					) }

					<StatsModuleComments
						className={ clsx(
							'stats__flexible-grid-item--half',
							'stats__flexible-grid-item--full--large'
						) }
					/>

					{ /** TODO: The feature depends on Jetpack Sharing module and is disabled for all Jetpack Sites for now. */ }
					{ ! isJetpack && (
						<StatShares
							siteId={ siteId }
							className={ clsx(
								'stats__flexible-grid-item--half',
								'stats__flexible-grid-item--full--large'
							) }
						/>
					) }
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
		isOdysseyStats,
		isJetpack: isJetpackSite( state, siteId ),
	};
} );

export default connectComponent( StatsInsights );
