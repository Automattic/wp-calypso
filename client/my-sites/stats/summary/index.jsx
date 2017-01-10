/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import debugFactory from 'debug';
import { find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import HeaderCake from 'components/header-cake';
import StatsModule from '../stats-module';
import statsStringsFactory from '../stats-strings';
import Countries from '../stats-countries';
import StatsVideoSummary from '../stats-video-summary';
import VideoPlayDetails from '../stats-video-details';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';
import { getSelectedSite } from 'state/ui/selectors';

const debug = debugFactory( 'calypso:stats:site' );
const StatsStrings = statsStringsFactory();

const StatsSummary = React.createClass( {
	mixins: [ observe( 'summaryList' ) ],

	getActiveFilter: function() {
		return find( this.props.filters(), ( filter ) => {
			return this.props.path === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( this.props.path ) );
		} );
	},

	goBack: function() {
		const pathParts = this.props.path.split( '/' );
		const queryString = this.props.context.querystring ? '?' + this.props.context.querystring : null;

		if ( history.length ) {
			history.back();
		} else {
			setTimeout( function() {
				page.show( '/stats/' + pathParts[ pathParts.length - 1 ] + queryString );
			} );
		}
	},

	getDefaultProps: function() {
		return {
			filters: Object.freeze( [] )
		};
	},

	getInitialState: function() {
		return {
			date: this.props.date
		};
	},

	componentDidMount: function() {
		window.scrollTo( 0, 0 );
	},

	render: function() {
		const { site, translate } = this.props;
		const summaryViews = [];
		let title;
		let summaryView;
		let chartTitle;
		let barChart;

		debug( 'Rendering summary-top-posts.jsx', this.props );

		switch ( this.props.context.params.module ) {

			case 'referrers':
				title = translate( 'Referrers' );
				summaryView = <StatsModule
					key="referrers-summary"
					path={ 'referrers' }
					moduleStrings={ StatsStrings.referrers }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'clicks':
				title = translate( 'Clicks' );
				summaryView = <StatsModule
					key="clicks-summary"
					path={ 'clicks' }
					moduleStrings={ StatsStrings.clicks }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'countryviews':
				title = translate( 'Countries' );
				summaryView = <Countries
					key="countries-summary"
					path="countries-summary"
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'posts':
				title = translate( 'Posts & Pages' );
				summaryView = <StatsModule
					key="posts-summary"
					path={ 'posts' }
					moduleStrings={ StatsStrings.posts }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'authors':
				title = translate( 'Authors' );
				// TODO: should be refactored so that className doesn't have to be passed in
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				summaryView = <StatsModule
					key="authors-summary"
					path={ 'authors' }
					moduleStrings={ StatsStrings.authors }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					followList={ this.props.followList }
					className="stats__author-views"
					summary={ true } />;
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				break;

			case 'videoplays':
				title = translate( 'Videos' );
				summaryView = <StatsModule
					key="videoplays-summary"
					path={ 'videoplays' }
					moduleStrings={ StatsStrings.videoplays }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					followList={ this.props.followList }
					summary={ true } />;
				break;

			case 'podcastdownloads':
				title = translate( 'Podcasts' );
				summaryView = <StatsModule
					key="podcastdownloads-summary"
					path={ 'podcastdownloads' }
					moduleStrings={ StatsStrings.podcastdownloads }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					followList={ this.props.followList }
					summary={ true } />;
				break;

			case 'videodetails':
				title = translate( 'Video' );

				if ( this.props.summaryList.response.post ) {
					title = this.props.summaryList.response.post.post_title;
				}

				// TODO: a separate StatsSectionTitle component should be created
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				chartTitle = (
					<h3 key="summary-title" className="stats-section-title">
						{ translate( 'Video Details' ) }
					</h3>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */

				summaryViews.push( chartTitle );
				barChart = <StatsVideoSummary key="video-chart" dataList={ this.props.summaryList } />;

				summaryViews.push( barChart );

				summaryView = <VideoPlayDetails
					summaryList={ this.props.summaryList }
					key="page-embeds" />;
				break;

			case 'searchterms':
				title = translate( 'Search Terms' );
				summaryView = <StatsModule
					key="search-terms-summary"
					path={ 'searchterms' }
					moduleStrings={ StatsStrings.search }
					site={ site }
					dataList={ this.props.summaryList }
					period={ this.props.period }
					summary={ true } />;
				break;
		}

		summaryViews.push( summaryView );

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />
				<div id="my-stats-content">
					<HeaderCake onClick={ this.goBack }>
						{ title }
					</HeaderCake>
					{ summaryViews }
				</div>
			</Main>
		);
	}
} );

export default connect( ( state ) => {
	return {
		site: getSelectedSite( state )
	};
} )( localize( StatsSummary ) );
