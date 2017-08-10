/** @format */
/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { noop, omitBy, isUndefined } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import FollowButton from './button';
import { isFollowing } from 'state/selectors';
import { follow, unfollow } from 'state/reader/follows/actions';

class FollowButtonContainer extends Component {
	static propTypes = {
		siteUrl: React.PropTypes.string.isRequired,
		iconSize: React.PropTypes.number,
		onFollowToggle: React.PropTypes.func,
		followLabel: React.PropTypes.string,
		followingLabel: React.PropTypes.string,
		feedId: React.PropTypes.number,
		siteId: React.PropTypes.number,
	};

	static defaultProps = {
		onFollowToggle: noop,
	};
	handleFollowToggle = following => {
		if ( following ) {
			const followData = omitBy(
				{
					feed_ID: this.props.feedId,
					blog_ID: this.props.siteId,
				},
				isUndefined
			);

			this.props.follow( this.props.siteUrl, followData );
		} else {
			this.props.unfollow( this.props.siteUrl );
		}
		this.props.onFollowToggle( following );
	};

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
				className={ this.props.className }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		following: isFollowing( state, { feedUrl: ownProps.siteUrl } ),
	} ),
	{
		follow,
		unfollow,
	}
)( FollowButtonContainer );
