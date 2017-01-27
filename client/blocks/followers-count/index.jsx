/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';

class FollowersCount extends Component {
	render() {
		const { slug, followers, translate, siteId } = this.props;

		if ( ! followers ) {
			return null;
		}

		return (
			<div className="followers-count">
				{ siteId && <QuerySiteStats statType="stats" siteId={ siteId } /> }
				<Button
					borderless
					href={ '/people/followers/' + slug }
					title={ translate( 'Total of WordPress and Email Followers' ) }
					>
					{ translate( 'Followers' ) } <Count count={ followers } />
				</Button>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const data = getSiteStatsNormalizedData( state, siteId, 'stats' );

	return {
		slug: getSiteSlug( state, siteId ),
		followers: get( data, 'followersBlog' ),
	};
} )( localize( FollowersCount ) );
