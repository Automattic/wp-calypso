/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import FollowButton from './button';
import { follow, unfollow } from 'state/reader/follows/actions';
import { isFollowing } from 'state/selectors';

class FollowButtonContainer extends Component {
	static propTypes = {
		siteUrl: React.PropTypes.string.isRequired,
		iconSize: React.PropTypes.number,
		onFollowToggle: React.PropTypes.func,
		followLabel: React.PropTypes.string,
		followingLabel: React.PropTypes.string
	}

	static defaultProps = {
		onFollowToggle: noop
	}

	handleFollowToggle = ( following ) => {
		if ( following ) {
			this.props.follow( this.props.siteUrl );
		} else {
			this.props.unfollow( this.props.siteUrl );
		}
		this.props.onFollowToggle( following );
	}

	render() {
		return (
			<FollowButton
				following={ this.props.following }
				onFollowToggle={ this.handleFollowToggle }
				iconSize={ this.props.iconSize }
				tagName={ this.props.tagName }
				disabled={ this.props.disabled }
				followLabel={ this.props.followLabel }
				followingLabel={ this.props.followingLabel }
				className={ this.props.className } />
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		following: isFollowing( state, { feedUrl: ownProps.siteUrl } )
	} ),
	{
		follow,
		unfollow
	}
)( FollowButtonContainer );
