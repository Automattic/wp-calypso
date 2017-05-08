/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FollowButton from 'reader/follow-button';
import { recordFollowToggle } from './stats';

class DiscoverFollowButton extends React.Component {

	static propTypes = {
		siteName: React.PropTypes.string.isRequired,
		followUrl: React.PropTypes.string.isRequired
	}

	recordFollowToggle = ( isFollowing ) => {
		recordFollowToggle( isFollowing, this.props.siteUrl );
	}

	render() {
		if ( ! this.props.followUrl ) {
			return null;
		}

		const followLabel = this.props.translate( 'Follow %(siteName)s', {
			args: {
				siteName: this.props.siteName,
			}
		} );
		const followingLabel = this.props.translate( 'Following %(siteName)s', {
			args: {
				siteName: this.props.siteName,
			}
		} );

		return (
			<FollowButton
				className="is-discover"
				siteUrl={ this.props.followUrl }
				iconSize={ 20 }
				onFollowToggle={ this.recordFollowToggle }
				followLabel={ followLabel }
				followingLabel={ followingLabel } />
		);
	}
}

export default localize( DiscoverFollowButton );
