/**
* External dependencies
*/
var React = require( 'react/addons' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var StatsNavigation = require( './stats-navigation' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	AllTime = require( 'my-sites/stats/all-time/' ),
	Comments = require( './module-comments' ),
	Followers = require( './module-followers' ),
	PostTrends = require( 'my-sites/post-trends' ),
	SiteOverview = require( './overview' ),
	SiteOverviewPlaceholder = require( 'my-sites/stats/module-site-overview-placeholder' ),
	StatsModule = require( './stats-module' ),
	statsStrings = require( './stats-strings' ),
	MostPopular = require( 'my-sites/stats/most-popular' ),
	PostPerformance = require( './post-performance' ),
	analytics = require( 'analytics' ),
	observe = require( 'lib/mixins/data-observe' ),
	touchDetect = require( 'lib/touch-detect' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'StatsInsights',

	mixins: [ observe( 'summaryData' ) ],

	propTypes: {
		streakList: React.PropTypes.object.isRequired,
		allTimeList: React.PropTypes.object.isRequired,
		statSummaryList: React.PropTypes.object.isRequired,
		insightsList: React.PropTypes.object.isRequired,
		summaryDate: React.PropTypes.string
	},

	getInitialState: function() {
		return { surveyAnswered: false };
	},

	surveyYes: function() {
		this.setState( { surveyAnswered: true } );
		store.set( 'StatsInsightsSurvey', true );
		analytics.tracks.recordEvent( 'calypso_insights_survey_taken', { insights_survey_response: 'yes' } );
	},

	surveyNo: function() {
		this.setState( { surveyAnswered: true } );
		store.set( 'StatsInsightsSurvey', true );
		analytics.tracks.recordEvent( 'calypso_insights_survey_taken', { insights_survey_response: 'no' } );
	},

	render: function() {
		var site = this.props.site,
			summaryData,
			moduleStrings = statsStrings(),
			overview = ( <SiteOverviewPlaceholder insights={ true } /> ),
			postTrends = null,
			survey = null,
			tagsList = null;

		if ( site ) {
			summaryData = this.props.statSummaryList.get( site.ID, this.props.summaryDate );
			if ( summaryData ) {
				overview = ( <SiteOverview site={ site } summaryData={ summaryData } path={ '/stats/day' } insights={ true } /> );
			}

			if ( ! site.jetpack ) {
				tagsList = <StatsModule path={ 'tags-categories' } moduleStrings={ moduleStrings.tags } site={ site } dataList={ this.props.tagsList } beforeNavigate={ this.updateScrollPosition } />;
			}
		}

		if ( ! touchDetect.hasTouch() ) {
			postTrends = ( <PostTrends streakList={ this.props.streakList } /> );
		}

		if ( store.enabled && ! store.get( 'StatsInsightsSurvey' ) ) {
			survey = (
				<Card className="stats-poll">
					<span className="stats-poll__message">Did you find this page useful?</span>
					<button className="button stats-poll__button" onClick={ this.surveyYes }>Yes</button>
					<button className="button stats-poll__button" onClick={ this.surveyNo }>No</button>
				</Card>
			);
		} else if ( this.state.surveyAnswered ) {
			survey = (
				<Card className="stats-poll is-gone">
					Thanks for your feedback!
				</Card>
			);
		}

		return (
			<div className="main main-column" role="main">
				<SidebarNavigation />
				<StatsNavigation section="insights" site={ site } />
				<div id="my-stats-content">
					{ postTrends }

					<PostPerformance site={ this.props.site } />

					{ overview }

					<AllTime allTimeList={ this.props.allTimeList } />

					<MostPopular insightsList={ this.props.insightsList } />

					<div className="stats-nonperiodic has-recent">
						<h3 className="stats-section-title">{ this.translate( 'Other Recent Stats', { context: 'Heading for non periodic site stats' } ) }</h3>
						<div className="module-list">
							<div className="module-column">
								<Comments path={ 'comments' } site={ site } commentsList={ this.props.commentsList } followList={ this.props.followList } commentFollowersList={ this.props.commentFollowersList } />
								{ tagsList }
							</div>
							<div className="module-column">
								<Followers path={ 'followers' } site={ site } wpcomFollowersList={ this.props.wpcomFollowersList } emailFollowersList={ this.props.emailFollowersList } followList={ this.props.followList } />
								<StatsModule path={ 'publicize' } moduleStrings={ moduleStrings.publicize } site={ site } dataList={ this.props.publicizeList } />
							</div>
						</div>
					</div>

				</div>
			</div>
		);
	}
} );
