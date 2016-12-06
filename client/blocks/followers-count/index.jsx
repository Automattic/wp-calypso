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
import { getSelectedSite } from 'state/ui/selectors';

class FollowersCount extends Component {
	render() {
		const { slug, followers, translate } = this.props;

		if ( ! followers ) {
			return null;
		}

		return (
			<div className="followers-count">
				<Button borderless href={ '/people/followers/' + slug }>
					{ translate( 'Followers' ) } <Count count={ followers } />
				</Button>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );

	return {
		slug: get( site, 'slug' ),
		followers: get( site, 'subscribers_count' ),
	};
} )( localize( FollowersCount ) );
