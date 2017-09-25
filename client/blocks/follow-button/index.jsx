/**
 * External dependencies
 */
import { noop, omitBy, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FollowButton from './button';
import { follow, unfollow } from 'state/reader/follows/actions';
import { isFollowing } from 'state/selectors';

class FollowButtonContainer extends Component {
	static propTypes = {
		siteUrl: PropTypes.string.isRequired,
		iconSize: PropTypes.number,
		onFollowToggle: PropTypes.func,
		followLabel: PropTypes.string,
		followingLabel: PropTypes.string,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
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
