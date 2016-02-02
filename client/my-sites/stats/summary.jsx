/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:stats:site' );
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	HeaderCake = require( 'components/header-cake' ),
	StatsModule = require( './stats-module' ),
	StatsStrings = require( './stats-strings' )(),
	Countries = require( './stats-countries' ),
	SummaryChart = require( './stats-summary-chart' ),
	VideoPlayDetails = require( './stats-video-details' );
import { getStatsItem, isStatsItemFetching } from 'state/stats/selectors';
import { fetchSiteStats } from 'state/stats/actions';
import { getStatsTypesByModule } from 'state/stats/utils';

const StatsSummary = React.createClass( {
	displayName: 'StatsSummary',

	mixins: [ observe( 'sites' ) ],

	getActiveFilter: function() {
		return this.props.filters().filter( function( filter ) {
			return this.props.path === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( this.props.path ) );
		}, this ).shift();
	},

	goBack: function() {
		var pathParts = this.props.path.split( '/' ),
			queryString = this.props.querystring ? '?' + this.props.querystring : null;

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

	componentWillMount() {
		this.dispatchFetchActions();
	},

	dispatchFetchActions() {
		const { domain, siteID } = this.props;
		this.props.fetchActions.forEach( ( action ) => {
			const { statType, options } = action;

			this.props.dispatch( fetchSiteStats( {
				domain,
				siteID,
				statType,
				options
			} ) );
		} );
	},

	componentDidMount: function() {
		window.scrollTo( 0, 0 );
	},

	render: function() {
		let summaryViews = [],
			title,
			summaryView,
			chartTitle,
			barChart;

		debug( 'Rendering summary-top-posts.jsx', this.props );

		const { module, moduleState, sites } = this.props;
		const site = sites.getSelectedSite();

		switch ( module ) {
			case 'referrers':
				title = this.translate( 'Referrers' );
				summaryView = <StatsModule
					key='referrers-summary'
					path={ 'referrers' }
					moduleStrings={ StatsStrings.referrers }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'clicks':
				title = this.translate( 'Clicks' );
				summaryView = <StatsModule
					key='clicks-summary'
					path={ 'clicks' }
					moduleStrings={ StatsStrings.clicks }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'countryviews':
				title = this.translate( 'Countries' );
				summaryView = <Countries
					key='countries-summary'
					path='countries-summary'
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'posts':
				title = this.translate( 'Posts & Pages' );
				summaryView = <StatsModule
					key='posts-summary'
					path={ 'posts' }
					moduleStrings={ StatsStrings.posts }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					summary={ true } />;
				break;

			case 'authors':
				title = this.translate( 'Authors' );
				summaryView = <StatsModule
					key='authors-summary'
					path={ 'authors' }
					moduleStrings={ StatsStrings.authors }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					followList={ this.props.followList }
					className='authorviews'
					summary={ true } />;
				break;

			case 'videoplays':
				title = this.translate( 'Videos' );
				summaryView = <StatsModule
					key='videoplays-summary'
					path={ 'videoplays' }
					moduleStrings={ StatsStrings.videoplays }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					followList={ this.props.followList }
					summary={ true } />;
				break;

			case 'videodetails':
				title = this.translate( 'Video' );
				if ( moduleState.response.post ) {
					title = moduleState.response.post.post_title;
				}

				chartTitle = (
					<h3 key="summary-title" className="stats-section-title">
						{ this.translate( 'Video Details' ) }
					</h3>
				);

				summaryViews.push( chartTitle );

				barChart = <SummaryChart
					key='video-chart'
// @TODO move this to the component based on `moduleState`
loading={ false }
					moduleState={ moduleState }
					activeKey="period"
					dataKey='value'
					labelKey='period'
					labelClass="video"
					tabLabel={ this.translate( 'Plays' ) } />;

				summaryViews.push( barChart );

				summaryView = <VideoPlayDetails
					moduleState={ moduleState }
					key='page-embeds' />;
				break;

			case 'searchterms':
				title = this.translate( 'Search Terms' );
				summaryView = <StatsModule
					key='search-terms-summary'
					path={ 'searchterms' }
					moduleStrings={ StatsStrings.search }
					site={ site }
					moduleState={ moduleState }
					period={ this.props.period }
					summary={ true } />;
				break;
		}

		summaryViews.push( summaryView );

		return (
			<div className="main main-column" role="main">
				<div id="my-stats-content">
					<HeaderCake onClick={ this.goBack }>
						{ title }
					</HeaderCake>
					{ summaryViews }
				</div>
			</div>
		);
	}
} );

export default connect(
	function mapStateToProps( state, ownProps ) {
		const { fetchActions, module, postID, siteID } = ownProps;
		const statTypes = getStatsTypesByModule( module );

		const moduleState = {};
		fetchActions.forEach( ( action ) => {
			const { options, statType } = action;
			if ( ! statTypes.includes( statType ) ) {
				throw new Error( 'Invalid statType action for this module' );
			}
			const params = { siteID, postID, statType, options };
			moduleState[statType] = {
				response: getStatsItem( state, params ),
				isFetching: isStatsItemFetching( state, params )
			};
		} );

		return { moduleState };
	}
)( StatsSummary );
