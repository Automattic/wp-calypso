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
import PostingActivity from '../post-trends';
import TodaysStats from '../stats-site-overview';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'my-sites/stats/most-popular';
import LatestPostSummary from '../post-performance';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { CUSTOM_DOMAIN } from 'lib/plans/constants';

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
		site: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ),
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

		let tagsList;
		let summaryData = statSummaryList.get( site.ID, summaryDate );

		if ( ! site.jetpack ) {
			tagsList = <StatsModule
							path={ 'tags-categories' }
							moduleStrings={ moduleStrings.tags }
							site={ site }
							dataList={ this.props.tagsList }
							beforeNavigate={ this.updateScrollPosition } />;
		}

		return (
			<div className="main main-column" role="main">
				<SidebarNavigation />
				<StatsNavigation section="insights" site={ site } />
				<div id="my-stats-content">
					<PostingActivity streakList={ streakList } />
					<LatestPostSummary site={ site } />
					<TodaysStats
						site={ site }
						summaryData={ summaryData }
						path={ '/stats/day' }
						insights={ true }
					/>
					<AllTime allTimeList={ allTimeList } />
					<MostPopular insightsList={ insightsList } />
					<UpgradeNudge
						title={ this.translate( 'Get a free Custom Domain' ) }
						message={ this.translate( 'Custom domains are free when you upgrade to a Premium or Business plan.' ) }
						feature={ CUSTOM_DOMAIN }
						event="stats_insights_domain"
					/>
					<div className="stats-nonperiodic has-recent">
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
