/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FollowButton from 'reader/follow-button';
import { recordFollowToggle } from './stats';
import { DISCOVER_POST } from 'reader/follow-sources';

class DiscoverFollowButton extends React.Component {
	static propTypes = {
		siteName: PropTypes.string.isRequired,
		followUrl: PropTypes.string.isRequired,
	};

	recordFollowToggle = ( isFollowing ) => {
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

		/* eslint-disable wpcalypso/jsx-classname-namespace */
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
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( DiscoverFollowButton );
