/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';
import { getSelectedSite } from 'state/ui/selectors';

class FollowersCount extends Component {
	render() {
		const { site, translate } = this.props;

		if ( ! site || ! site.subscribers_count ) {
			return null;
		}

		return (
			<div className="followers-count">
				<Button borderless href={ '/people/followers/' + site.slug }>
					{ translate( 'Followers' ) } <Count count={ site.subscribers_count } />
				</Button>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );

	return {
		site
	};
} )( localize( FollowersCount ) );
