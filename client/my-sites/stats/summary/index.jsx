import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { merge } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import QueryMedia from 'calypso/components/data/query-media';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import AnnualSiteStats from 'calypso/my-sites/stats/annual-site-stats';
import StatsModuleAuthors from 'calypso/my-sites/stats/features/modules/stats-authors';
import StatsModuleClicks from 'calypso/my-sites/stats/features/modules/stats-clicks';
import StatsModuleCountries from 'calypso/my-sites/stats/features/modules/stats-countries';
import StatsModuleDownloads from 'calypso/my-sites/stats/features/modules/stats-downloads';
import StatsModuleReferrers from 'calypso/my-sites/stats/features/modules/stats-referrers';
import StatsModuleSearch from 'calypso/my-sites/stats/features/modules/stats-search';
import StatsModuleTopPosts from 'calypso/my-sites/stats/features/modules/stats-top-posts';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsModuleUTM from '../features/modules/stats-utm';
import { StatsGlobalValuesContext } from '../pages/providers/global-provider';
import DownloadCsv from '../stats-download-csv';
import AllTimeNav from '../stats-module/all-time-nav';
import PageViewTracker from '../stats-page-view-tracker';
import statsStringsFactory from '../stats-strings';
import StatsUpsellModal from '../stats-upsell-modal';
import VideoPlayDetails from '../stats-video-details';
import StatsVideoSummary from '../stats-video-summary';
import VideoPressStatsModule from '../videopress-stats-module';

import './style.scss';

const StatsStrings = statsStringsFactory();

class StatsSummary extends Component {
	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	renderSummaryHeader( path, statType, hideNavigation, query ) {
		const period = this.props.period;

		const headerCSVButton = (
			<div className="stats-module__heaver-nav-button">
				<DownloadCsv statType={ statType } query={ query } path={ path } period={ period } />
			</div>
		);

		return (
			<AllTimeNav
				path={ path }
				query={ query }
				period={ period }
				hideNavigation={ hideNavigation }
				navigationSwap={ headerCSVButton }
			/>
		);
	}

	render() {
		const { translate, statsQueryOptions, siteId, supportsUTMStats } = this.props;
		const summaryViews = [];
		let title;
		let summaryView;
		let chartTitle;
		let barChart;
		let path;
		let statType;

		// Navigation settings. One of the following, depending on the summary view.
		// Traffic => /stats/day/
		// Insights => /stats/insights/
		const localizedTabNames = {
			traffic: translate( 'Traffic' ),
			insights: translate( 'Insights' ),
		};
		let backLabel = localizedTabNames.traffic;
		let backLink = `/stats/day/`;

		const { period, endOf } = this.props.period;
		const query = {
			period: period,
			date: endOf.format( 'YYYY-MM-DD' ),
			max: 0,
		};

		// Update query with date range if it provided.
		const dateRange = this.props.dateRange;
		if ( dateRange ) {
			query.start_date = dateRange.startDate.format( 'YYYY-MM-DD' );
			query.date = dateRange.endDate.format( 'YYYY-MM-DD' );
			query.summarize = 1;
		}

		const moduleQuery = merge( {}, statsQueryOptions, query );
		const urlParams = new URLSearchParams( this.props.context.querystring );
		const listItemClassName = 'stats__summary--narrow-mobile';

		switch ( this.props.context.params.module ) {
			case 'referrers':
				title = translate( 'Referrers' );
				path = 'referrers';
				statType = 'statsReferrers';

				summaryView = (
					<Fragment key="referrers-summary">
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModuleReferrers
							moduleStrings={ StatsStrings.referrers }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'clicks':
				title = translate( 'Clicks' );
				path = 'clicks';
				statType = 'statsClicks';

				summaryView = (
					<Fragment key="clicks-summary">
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModuleClicks
							moduleStrings={ StatsStrings.clicks }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'countryviews':
				title = translate( 'Countries' );
				path = 'countryviews';
				statType = 'statsCountryViews';

				summaryView = (
					<Fragment key="countries-summary">
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModuleCountries
							moduleStrings={ StatsStrings.countries }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'posts':
				title = translate( 'Posts & pages' );
				path = 'posts';
				statType = 'statsTopPosts';

				summaryView = (
					<Fragment key="posts-summary">
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModuleTopPosts
							moduleStrings={ StatsStrings.posts }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'authors':
				title = translate( 'Authors' );
				path = 'authors';
				statType = 'statsTopAuthors';

				// TODO: should be refactored so that className doesn't have to be passed in
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				summaryView = (
					<Fragment key="authors-summary">
						{ this.renderSummaryHeader( path, statType, true, query ) }
						<StatsModuleAuthors
							moduleStrings={ StatsStrings.authors }
							period={ this.props.period }
							query={ query }
							className="stats__author-views"
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				break;

			case 'videoplays':
				title = translate( 'Videos' );
				path = 'videoplays';
				statType = 'statsVideoPlays';

				summaryView = (
					<Fragment key="videopress-stats-module">
						{ /* For CSV button to work, video page needs to pass custom data to the button.
								It can't use the shared header as long as the CSV download button stays there. */ }
						<VideoPressStatsModule
							path={ path }
							moduleStrings={ StatsStrings.videoplays }
							period={ this.props.period }
							query={ query }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'filedownloads':
				title = translate( 'File Downloads' );
				path = 'filedownloads';
				statType = 'statsFileDownloads';

				summaryView = (
					<Fragment key="filedownloads-summary">
						{ this.renderSummaryHeader( path, statType, true, query ) }
						<StatsModuleDownloads
							moduleStrings={ StatsStrings.filedownloads }
							period={ this.props.period }
							query={ query }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;

			case 'videodetails':
				title = translate( 'Video' );
				if ( this.props.media ) {
					title = this.props.media.title;
				}

				// TODO: a separate StatsSectionTitle component should be created
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				chartTitle = (
					<h3 key="summary-title" className="stats-section-title">
						{ translate( 'Video Details' ) }
					</h3>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */

				if ( siteId ) {
					summaryViews.push(
						<QueryMedia key="query-media" siteId={ siteId } mediaId={ this.props.postId } />
					);
				}
				summaryViews.push( chartTitle );
				barChart = (
					<StatsVideoSummary
						key="video-chart"
						postId={ this.props.postId }
						period={ this.props.period.period }
						statType={ urlParams.get( 'statType' ) }
					/>
				);

				summaryViews.push( barChart );
				summaryView = (
					<VideoPlayDetails
						key="page-embeds"
						postId={ this.props.postId }
						period={ this.props.period.period }
						statType={ urlParams.get( 'statType' ) }
					/>
				);
				break;

			case 'searchterms':
				title = translate( 'Search Terms' );
				path = 'searchterms';
				statType = 'statsSearchTerms';

				summaryView = (
					<Fragment key="search-terms-summary">
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModuleSearch
							moduleStrings={ StatsStrings.search }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
					</Fragment>
				);
				break;
			case 'annualstats':
				title = translate( 'Annual insights' );
				backLabel = localizedTabNames.insights;
				backLink = `/stats/insights/`;
				summaryView = <AnnualSiteStats key="annualstats" />;
				break;
			case 'utm': {
				title = translate( 'UTM insights' );
				backLabel = localizedTabNames.traffic;
				backLink = `/stats/traffic/`;
				path = 'utm';
				statType = 'statsUTM';
				summaryView = <></>; // done inline to use context values
				break;
			}
			case 'devices': {
				// TODO: finish after the Traffic page.
				title = translate( 'Devices' );
				path = 'devices';
				statType = 'statsDevices';

				summaryView = <></>;
				break;
			}
		}

		summaryViews.push( summaryView );

		const { module } = this.props.context.params;

		const domain = this.props.siteSlug;
		if ( domain?.length > 0 ) {
			backLink += domain;
		}
		const navigationItems = [ { label: backLabel, href: backLink }, { label: title } ];

		return (
			<Main className="has-fixed-nav" wideLayout>
				<PageViewTracker
					path={ `/stats/${ period }/${ module }/:site` }
					title={ `Stats > ${ titlecase( period ) } > ${ titlecase( module ) }` }
				/>
				<NavigationHeader className="stats-summary-view" navigationItems={ navigationItems } />

				<div id="my-stats-content" className="stats-summary-view stats-summary__positioned">
					{ this.props.context.params.module === 'utm' ? (
						<StatsGlobalValuesContext.Consumer>
							{ ( isInternal ) => (
								<>
									{ supportsUTMStats || isInternal ? (
										<>
											{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
											<StatsModuleUTM
												siteId={ siteId }
												period={ this.props.period }
												query={ moduleQuery }
												summary
											/>
										</>
									) : (
										<div>{ translate( 'This path is not available.' ) }</div>
									) }
								</>
							) }
						</StatsGlobalValuesContext.Consumer>
					) : (
						summaryViews
					) }
					<JetpackColophon />
				</div>
				{ this.props.upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
			</Main>
		);
	}
}

export default connect( ( state, { context, postId } ) => {
	const siteId = getSelectedSiteId( state );
	const upsellModalView = isEnabled( 'stats/paid-wpcom-v2' ) && getUpsellModalView( state, siteId );

	const { supportsUTMStats } = getEnvStatsFeatureSupportChecks( state, siteId );

	return {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state, siteId ),
		media: context.params.module === 'videodetails' ? getMediaItem( state, siteId, postId ) : false,
		upsellModalView,
		supportsUTMStats,
	};
} )( localize( StatsSummary ) );
