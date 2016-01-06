/**
* External dependencies
*/
import React from 'react';
import store from 'store';

/**
 * Internal dependencies
 */
import StatsNavigation from '../stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AllTime from 'my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Followers from '../module-followers';
import PostTrends from 'my-sites/post-trends';
import SiteOverview from '../overview';
import SiteOverviewPlaceholder from 'my-sites/stats/module-site-overview-placeholder';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'my-sites/stats/most-popular';
import PostPerformance from '../post-performance';
import analytics from 'analytics';
import observe from 'lib/mixins/data-observe';
import touchDetect from 'lib/touch-detect';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'StatsInsights',

	mixins: [ observe( 'summaryData' ) ],

	propTypes: {
		streakList: React.PropTypes.object.isRequired,
		allTimeList: React.PropTypes.object.isRequired,
		statSummaryList: React.PropTypes.object.isRequired,
		insightsList: React.PropTypes.object.isRequired,
		summaryDate: React.PropTypes.string
	},

	getInitialState() {
		return { surveyAnswered: false };
	},

	surveyYes() {
		this.setState( { surveyAnswered: true } );
		store.set( 'StatsInsightsSurvey', true );
		analytics.tracks.recordEvent( 'calypso_insights_survey_taken', { insights_survey_response: 'yes' } );
	},

	surveyNo() {
		this.setState( { surveyAnswered: true } );
		store.set( 'StatsInsightsSurvey', true );
		analytics.tracks.recordEvent( 'calypso_insights_survey_taken', { insights_survey_response: 'no' } );
	},

	render() {
		const site = this.props.site,
			moduleStrings = statsStrings();

		let postTrends = null,
			tagsList = null,
			overview = ( <SiteOverviewPlaceholder insights={ true } /> );

		if ( site ) {
			let summaryData = this.props.statSummaryList.get( site.ID, this.props.summaryDate );
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
			let survey = (
				<Card className="stats-poll">
					<span className="stats-poll__message">Did you find this page useful?</span>
					<button className="button stats-poll__button" onClick={ this.surveyYes }>Yes</button>
					<button className="button stats-poll__button" onClick={ this.surveyNo }>No</button>
				</Card>
			);
		} else if ( this.state.surveyAnswered ) {
			let survey = (
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
