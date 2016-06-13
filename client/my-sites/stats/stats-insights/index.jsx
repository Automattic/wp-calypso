/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import i18n from 'i18n-calypso';

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
import DomainTip from 'my-sites/domain-tip';

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
			wpcomFollowersList } = this.props;

		const moduleStrings = statsStrings();

		let tagsList;

		let momentSiteZone = i18n.moment();

		if ( site && site.options ) {
			momentSiteZone = i18n.moment().utcOffset( site.options.gmt_offset );
		}

		const summaryDate = momentSiteZone.format( 'YYYY-MM-DD' );

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
					<PostingActivity />
					<LatestPostSummary site={ site } />
					<TodaysStats
						siteId={ site ? site.ID : 0 }
						period="day"
						date={ summaryDate }
						path={ '/stats/day' }
						title={ this.translate( 'Today\'s Stats' ) }
					/>
					<AllTime allTimeList={ allTimeList } />
					<MostPopular insightsList={ insightsList } />
					<DomainTip siteId={ site ? site.ID : 0 } event="stats_insights_domain" />
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
