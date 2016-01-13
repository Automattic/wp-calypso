/**
* External dependencies
*/
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import StatsNavigation from '../stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AllTime from 'my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Followers from '../stats-followers';
import PostTrends from 'my-sites/post-trends';
import SiteOverview from '../stats-site-overview';
import SiteOverviewPlaceholder from 'my-sites/stats/stats-overview-placeholder';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'my-sites/stats/most-popular';
import PostPerformance from '../post-performance';
import touchDetect from 'lib/touch-detect';

export default React.createClass( {
	displayName: 'StatsInsights',

	propTypes: {
		allTimeList: PropTypes.object.isRequired,
		commentFollowersList: PropTypes.object.isRequired,
		commentsList: PropTypes.object.isRequired,
		emailFollowersList: PropTypes.object.isRequired,
		followList: PropTypes.object.isRequired,
		insightsList: PropTypes.object.isRequired,
		publicizeList: PropTypes.object.isRequired,
		site: PropTypes.object,
		statSummaryList: PropTypes.object.isRequired,
		streakList: PropTypes.object.isRequired,
		summaryDate: PropTypes.string,
		wpcomFollowersList: PropTypes.object
	},

	render() {
		const {
			allTimeList,
			commentFollowersList,
			commentsList,
			emailFollowersList,
			followList,
			insightsList,
			publicizeList,
			site,
			statSummaryList,
			streakList,
			summaryDate,
			wpcomFollowersList } = this.props;

		const moduleStrings = statsStrings();

		let postTrends;
		let tagsList;
		let overview = <SiteOverviewPlaceholder insights={ true } />;

		if ( site ) {
			let summaryData = statSummaryList.get( site.ID, summaryDate );
			if ( summaryData ) {
				overview = <SiteOverview site={ site } summaryData={ summaryData } path={ '/stats/day' } insights={ true } />;
			}

			if ( ! site.jetpack ) {
				tagsList = <StatsModule path={ 'tags-categories' } moduleStrings={ moduleStrings.tags } site={ site } dataList={ this.props.tagsList } beforeNavigate={ this.updateScrollPosition } />;
			}
		}

		if ( ! touchDetect.hasTouch() ) {
			postTrends = <PostTrends streakList={ streakList } />;
		}

		return (
			<div className="main main-column" role="main">
				<SidebarNavigation />
				<StatsNavigation section="insights" site={ site } />
				<div id="my-stats-content">
					{ postTrends }
					<PostPerformance site={ site } />
					{ overview }
					<AllTime allTimeList={ allTimeList } />
					<MostPopular insightsList={ insightsList } />
					<div className="stats-nonperiodic has-recent">
						<h3 className="stats-section-title">{ this.translate( 'Other Recent Stats', { context: 'Heading for non periodic site stats' } ) }</h3>
						<div className="module-list">
							<div className="module-column">
								<Comments
									path={ 'comments' }
									site={ site }
									commentsList={ commentsList }
									followList={ followList }
									commentFollowersList={ commentFollowersList } />
								{ tagsList }
							</div>
							<div className="module-column">
								<Followers
									path={ 'followers' }
									site={ site }
									wpcomFollowersList={ wpcomFollowersList }
									emailFollowersList={ emailFollowersList }
									followList={ followList } />
								<StatsModule
									path={ 'publicize' }
									moduleStrings={ moduleStrings.publicize }
									site={ site }
									dataList={ publicizeList } />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
} );
