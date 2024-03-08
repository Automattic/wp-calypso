import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
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

		const followLabel = this.props.translate( 'Subscribe to %(siteName)s', {
			args: {
				siteName: this.props.siteName,
			},
		} );
		const followingLabel = this.props.translate( 'Subscribed to %(siteName)s', {
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
				followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
				followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( DiscoverFollowButton );
