/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import i18n from 'i18n-calypso';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import StatsNavigation from '../stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AllTime from 'my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Followers from '../stats-followers';
import Reach from '../stats-reach';
import PostingActivity from '../post-trends';
import TodaysStats from '../stats-site-overview';
import StatsConnectedModule from '../stats-module/connected-list';
import statsStrings from '../stats-strings';
import MostPopular from 'my-sites/stats/most-popular';
import LatestPostSummary from '../post-performance';
import DomainTip from 'my-sites/domain-tip';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';

export default React.createClass( {
	displayName: 'StatsInsights',

	propTypes: {
		commentFollowersList: PropTypes.object.isRequired,
		commentsList: PropTypes.object.isRequired,
		emailFollowersList: PropTypes.object.isRequired,
		followList: PropTypes.object.isRequired,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ),
		summaryDate: PropTypes.string,
		wpcomFollowersList: PropTypes.object
	},

	render() {
		const {
			commentFollowersList,
			commentsList,
			emailFollowersList,
			followList,
			site,
			wpcomFollowersList } = this.props;

		const moduleStrings = statsStrings();


		let momentSiteZone = i18n.moment();

		const gmtOffset = get( site.options, 'gmt_offset', null );
		if ( gmtOffset ) {
			momentSiteZone = i18n.moment().utcOffset( gmtOffset );
		}

		const summaryDate = momentSiteZone.format( 'YYYY-MM-DD' );

		let tagsList;
		if ( ! site.jetpack ) {
			tagsList = (
				<StatsConnectedModule
					path="tags-categories"
					moduleStrings={ moduleStrings.tags }
					statType="statsTags" />
			);
		}

		// TODO: should be refactored into separate components
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main wideLayout={ true }>
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation section="insights" site={ site } />
				<div id="my-stats-content">
					<PostingActivity />
					<LatestPostSummary site={ site } />
					<Reach />
					<TodaysStats
						siteId={ site ? site.ID : null }
						period="day"
						date={ summaryDate }
						path={ '/stats/day' }
						title={ this.translate( 'Today\'s Stats' ) }
					/>
					<AllTime />
					<MostPopular />
					{ site && <DomainTip siteId={ site.ID } event="stats_insights_domain" /> }
					<div className="stats-insights__nonperiodic has-recent">
						<div className="stats__module-list">
							<div className="stats__module-column">
								<Comments
									path={ 'comments' }
									site={ site }
									commentsList={ commentsList }
									followList={ followList }
									commentFollowersList={ commentFollowersList } />
								{ tagsList }
							</div>
							<div className="stats__module-column">
								<Followers
									path={ 'followers' }
									site={ site }
									wpcomFollowersList={ wpcomFollowersList }
									emailFollowersList={ emailFollowersList }
									followList={ followList } />
								<StatsConnectedModule
									path="publicize"
									moduleStrings={ moduleStrings.publicize }
									statType="statsPublicize" />
							</div>
						</div>
					</div>
				</div>
			</Main>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
} );
