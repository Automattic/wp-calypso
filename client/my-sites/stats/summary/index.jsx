import { FEATURE_GOOGLE_ANALYTICS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { merge } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryMedia from 'calypso/components/data/query-media';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import AnnualSiteStats from 'calypso/my-sites/stats/annual-site-stats';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Countries from '../stats-countries';
import DownloadCsv from '../stats-download-csv';
import StatsModule from '../stats-module';
import AllTimeNav from '../stats-module/all-time-nav';
import PageViewTracker from '../stats-page-view-tracker';
import statsStringsFactory from '../stats-strings';
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
		const { translate, statsQueryOptions, siteId } = this.props;
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
		const moduleQuery = merge( {}, statsQueryOptions, query );
		const urlParams = new URLSearchParams( this.props.context.querystring );
		const listItemClassName = 'stats__summary--narrow-mobile';

		switch ( this.props.context.params.module ) {
			case 'referrers':
				title = translate( 'Referrers' );
				path = 'referrers';
				statType = 'statsReferrers';

				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModule
							key="referrers-summary"
							path={ path }
							moduleStrings={ StatsStrings.referrers }
							period={ this.props.period }
							query={ moduleQuery }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				break;

			case 'clicks':
				title = translate( 'Clicks' );
				path = 'clicks';
				statType = 'statsClicks';

				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModule
							key="clicks-summary"
							path={ path }
							moduleStrings={ StatsStrings.clicks }
							period={ this.props.period }
							query={ moduleQuery }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				break;

			case 'countryviews':
				title = translate( 'Countries' );
				path = 'countryviews';
				statType = 'statsCountryViews';

				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<Countries
							key="countries-summary"
							path={ path }
							period={ this.props.period }
							query={ moduleQuery }
							summary
							listItemClassName={ listItemClassName }
						/>
						<div className="stats-module__footer-actions--summary-tall">
							<UpsellNudge
								title={ translate( 'Add Google Analytics' ) }
								description={ translate(
									'Upgrade to a Premium Plan for Google Analytics integration.'
								) }
								event="googleAnalytics-stats-countries"
								feature={ FEATURE_GOOGLE_ANALYTICS }
								plan={ PLAN_PREMIUM }
								tracksImpressionName="calypso_upgrade_nudge_impression"
								tracksClickName="calypso_upgrade_nudge_cta_click"
								showIcon={ true }
							/>
						</div>
					</>
				);
				break;

			case 'posts':
				title = translate( 'Posts & pages' );
				path = 'posts';
				statType = 'statsTopPosts';

				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModule
							key="posts-summary"
							path={ path }
							moduleStrings={ StatsStrings.posts }
							period={ this.props.period }
							query={ moduleQuery }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				break;

			case 'authors':
				title = translate( 'Authors' );
				path = 'authors';
				statType = 'statsTopAuthors';

				// TODO: should be refactored so that className doesn't have to be passed in
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, true, query ) }
						<StatsModule
							key="authors-summary"
							path={ path }
							moduleStrings={ StatsStrings.authors }
							period={ this.props.period }
							query={ query }
							statType={ statType }
							className="stats__author-views"
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				break;

			case 'videoplays':
				title = translate( 'Videos' );
				path = 'videoplays';
				statType = 'statsVideoPlays';

				summaryView = (
					<>
						{ /* For CSV button to work, video page needs to pass custom data to the button.
								It can't use the shared header as long as the CSV download button stays there. */ }
						<VideoPressStatsModule
							key="videopress-stats-module"
							path={ path }
							moduleStrings={ StatsStrings.videoplays }
							period={ this.props.period }
							query={ query }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				break;

			case 'filedownloads':
				title = translate( 'File Downloads' );
				path = 'filedownloads';
				statType = 'statsFileDownloads';

				summaryView = (
					<>
						{ this.renderSummaryHeader( path, statType, true, query ) }
						<StatsModule
							key="filedownloads-summary"
							path={ path }
							moduleStrings={ StatsStrings.filedownloads }
							period={ this.props.period }
							query={ query }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
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
					<>
						{ this.renderSummaryHeader( path, statType, false, moduleQuery ) }
						<StatsModule
							key="search-terms-summary"
							path={ path }
							moduleStrings={ StatsStrings.search }
							period={ this.props.period }
							query={ moduleQuery }
							statType={ statType }
							summary
							listItemClassName={ listItemClassName }
						/>
					</>
				);
				break;
			case 'annualstats':
				title = translate( 'Annual insights' );
				backLabel = localizedTabNames.insights;
				backLink = `/stats/insights/`;
				summaryView = <AnnualSiteStats key="annualstats" />;
				break;
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
				<NavigationHeader navigationItems={ navigationItems } />

				<div id="my-stats-content" className="stats-summary-view stats-summary__positioned">
					{ summaryViews }
					<JetpackColophon />
				</div>
			</Main>
		);
	}
}

export default connect( ( state, { context, postId } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state, siteId ),
		media: context.params.module === 'videodetails' ? getMediaItem( state, siteId, postId ) : false,
	};
} )( localize( StatsSummary ) );
