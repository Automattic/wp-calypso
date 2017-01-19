/**
* External dependencies
*/
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';

class StatsReach extends Component {

	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		followData: PropTypes.object,
		publicizeData: PropTypes.array,
		isLoadingPublicize: PropTypes.bool,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			translate,
			siteId,
			followData,
			publicizeData,
			isLoadingPublicize,
			siteSlug,
		} = this.props;

		const isLoadingFollowData = ! followData;
		const isLoading = isLoadingFollowData || isLoadingPublicize;
		const wpcomFollowCount = get( followData, 'total_wpcom', 0 );
		const emailFollowCount = get( followData, 'total_email', 0 );
		const publicizeFollowCount = reduce( publicizeData, ( sum, item ) => {
			return sum + item.value;
		}, 0 );
		const totalFollowers = wpcomFollowCount + emailFollowCount + publicizeFollowCount;

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsFollowers" /> }
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsPublicize" /> }
				<SectionHeader label={ translate( 'Followers' ) } />
				<Card className={ classNames( 'stats-module', 'stats__overview' ) }>
					<StatsTabs borderless>
						<StatsTab
							gridicon="my-sites"
							label={ translate( 'WordPress.com' ) }
							loading={ isLoadingFollowData }
							href={ `/people/followers/${ siteSlug }` }
							value={ wpcomFollowCount } />
						<StatsTab
							gridicon="mail"
							label={ translate( 'Email' ) }
							loading={ isLoadingFollowData }
							href={ `/people/email-followers/${ siteSlug }` }
							value={ emailFollowCount } />
						<StatsTab
							gridicon="share"
							label={ translate( 'Publicize' ) }
							loading={ isLoadingPublicize }
							value={ publicizeFollowCount } />
						<StatsTab
							className="all-time__is-best"
							gridicon="user"
							label={ translate( 'Total' ) }
							loading={ isLoading }
							value={ totalFollowers }>
						</StatsTab>
					</StatsTabs>
				</Card>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const followData = getSiteStatsNormalizedData( state, siteId, 'statsFollowers' );
	const publicizeData = getSiteStatsNormalizedData( state, siteId, 'statsPublicize' );
	const isLoadingPublicize = isRequestingSiteStatsForQuery( state, siteId, 'statsPublicize' ) && ! publicizeData.length;
	const siteSlug = getSiteSlug( state, siteId );

	return {
		siteId,
		followData,
		publicizeData,
		isLoadingPublicize,
		siteSlug,
	};
} )( localize( StatsReach ) );
