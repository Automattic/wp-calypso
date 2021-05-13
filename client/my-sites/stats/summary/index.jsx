/**
 * External dependencies
 */

import React, { Component } from 'react';
import page from 'page';
import { merge } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'calypso/components/header-cake';
import StatsModule from '../stats-module';
import statsStringsFactory from '../stats-strings';
import Countries from '../stats-countries';
import StatsVideoSummary from '../stats-video-summary';
import VideoPlayDetails from '../stats-video-details';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titlecase from 'to-title-case';
import QueryMedia from 'calypso/components/data/query-media';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import AnnualSiteStats from 'calypso/my-sites/stats/annual-site-stats';

const StatsStrings = statsStringsFactory();

class StatsSummary extends Component {
	goBack = () => {
		const pathParts = this.props.path.split( '/' );
		const queryString = this.props.context.querystring
			? '?' + this.props.context.querystring
			: null;

		if ( history.length ) {
			history.back();
		} else {
			setTimeout( () => {
				page.show( '/stats/' + pathParts[ pathParts.length - 1 ] + queryString );
			} );
		}
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { translate, statsQueryOptions, siteId } = this.props;
		const summaryViews = [];
		let title;
		let summaryView;
		let chartTitle;
		let barChart;

		const { period, endOf } = this.props.period;
		const query = {
			period: period,
			date: endOf.format( 'YYYY-MM-DD' ),
			max: 0,
		};

		switch ( this.props.context.params.module ) {
			case 'referrers':
				title = translate( 'Referrers' );
				summaryView = (
					<StatsModule
						key="referrers-summary"
						path="referrers"
						moduleStrings={ StatsStrings.referrers }
						period={ this.props.period }
						query={ merge( {}, statsQueryOptions, query ) }
						statType="statsReferrers"
						summary
					/>
				);
				break;

			case 'clicks':
				title = translate( 'Clicks' );
				summaryView = (
					<StatsModule
						key="clicks-summary"
						path="clicks"
						moduleStrings={ StatsStrings.clicks }
						period={ this.props.period }
						query={ merge( {}, statsQueryOptions, query ) }
						statType="statsClicks"
						summary
					/>
				);
				break;

			case 'countryviews':
				title = translate( 'Countries' );
				summaryView = (
					<Countries
						key="countries-summary"
						path="countryviews"
						period={ this.props.period }
						query={ merge( {}, statsQueryOptions, query ) }
						summary={ true }
					/>
				);
				break;

			case 'posts':
				title = translate( 'Posts & pages' );
				summaryView = (
					<StatsModule
						key="posts-summary"
						path="posts"
						moduleStrings={ StatsStrings.posts }
						period={ this.props.period }
						query={ merge( {}, statsQueryOptions, query ) }
						statType="statsTopPosts"
						summary
					/>
				);
				break;

			case 'authors':
				title = translate( 'Authors' );
				// TODO: should be refactored so that className doesn't have to be passed in
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				summaryView = (
					<StatsModule
						key="authors-summary"
						path="authors"
						moduleStrings={ StatsStrings.authors }
						period={ this.props.period }
						query={ query }
						statType="statsTopAuthors"
						className="stats__author-views"
						summary={ true }
					/>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				break;

			case 'videoplays':
				title = translate( 'Videos' );
				summaryView = (
					<StatsModule
						key="videoplays-summary"
						path="videoplays"
						moduleStrings={ StatsStrings.videoplays }
						period={ this.props.period }
						query={ query }
						statType="statsVideoPlays"
						summary
					/>
				);
				break;

			case 'filedownloads':
				title = translate( 'File Downloads' );
				summaryView = (
					<StatsModule
						key="filedownloads-summary"
						path="filedownloads"
						moduleStrings={ StatsStrings.filedownloads }
						period={ this.props.period }
						query={ query }
						statType="statsFileDownloads"
						summary
					/>
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
				barChart = <StatsVideoSummary key="video-chart" postId={ this.props.postId } />;

				summaryViews.push( barChart );
				summaryView = <VideoPlayDetails key="page-embeds" postId={ this.props.postId } />;
				break;

			case 'searchterms':
				title = translate( 'Search Terms' );
				summaryView = (
					<StatsModule
						key="search-terms-summary"
						path="searchterms"
						moduleStrings={ StatsStrings.search }
						period={ this.props.period }
						query={ merge( {}, statsQueryOptions, query ) }
						statType="statsSearchTerms"
						summary
					/>
				);
				break;
			case 'annualstats':
				title = translate( 'Annual site stats' );
				summaryView = <AnnualSiteStats key="annualstats" />;
				break;
		}

		summaryViews.push( summaryView );

		const { module } = this.props.context.params;

		return (
			<Main wideLayout>
				<PageViewTracker
					path={ `/stats/${ period }/${ module }/:site` }
					title={ `Stats > ${ titlecase( period ) } > ${ titlecase( module ) }` }
				/>
				<div id="my-stats-content">
					<HeaderCake onClick={ this.goBack }>{ title }</HeaderCake>
					{ summaryViews }
				</div>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect( ( state, { context, postId } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId: getSelectedSiteId( state ),
		media: context.params.module === 'videodetails' ? getMediaItem( state, siteId, postId ) : false,
	};
} )( localize( StatsSummary ) );
