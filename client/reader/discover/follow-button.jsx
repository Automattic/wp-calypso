/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { recordFollowToggle } from './stats';
import FollowButton from 'reader/follow-button';
import { DISCOVER_POST } from 'reader/follow-button/follow-sources';

class DiscoverFollowButton extends React.Component {
	static propTypes = {
		siteName: PropTypes.string.isRequired,
		followUrl: PropTypes.string.isRequired,
	};

	recordFollowToggle = isFollowing => {
		recordFollowToggle( isFollowing, this.props.siteUrl );
	};

	render() {
		if ( ! this.props.followUrl ) {
			return null;
		}

		const followLabel = this.props.translate( 'Follow %(siteName)s', {
			args: {
				siteName: this.props.siteName,
			},
		} );
		const followingLabel = this.props.translate( 'Following %(siteName)s', {
			args: {
				siteName: this.props.siteName,
			},
		} );

		return (
			<FollowButton
				className="is-discover"
				siteUrl={ this.props.followUrl }
				iconSize={ 20 }
				onFollowToggle={ this.recordFollowToggle }
				followLabel={ followLabel }
				followingLabel={ followingLabel }
				followSource={ DISCOVER_POST }
			/>
		);
	}
}

export default localize( DiscoverFollowButton );
