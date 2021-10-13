import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FollowButton from 'calypso/reader/follow-button';
import { DISCOVER_POST } from 'calypso/reader/follow-sources';
import { recordFollowToggle } from './stats';

class DiscoverFollowButton extends Component {
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
