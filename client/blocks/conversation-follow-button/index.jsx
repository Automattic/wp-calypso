/**
 * @format
 */

/*
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ConversationFollowButton from './button';
import { isFollowingReaderConversation } from 'state/selectors';
import { followConversation, muteConversation } from 'state/reader/conversations/actions';

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
	};

	static defaultProps = {
		onFollowToggle: noop,
	};

	handleFollowToggle = isRequestingFollow => {
		const { siteId, postId } = this.props;

		if ( isRequestingFollow ) {
			this.props.followConversation( { siteId, postId } );
		} else {
			this.props.muteConversation( { siteId, postId } );
		}

		this.props.onFollowToggle( isRequestingFollow );
	};

	render() {
		return (
			<ConversationFollowButton
				isFollowing={ this.props.isFollowing }
				onFollowToggle={ this.handleFollowToggle }
				className={ this.props.className }
				tagName={ this.props.tagName }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isFollowing: isFollowingReaderConversation( state, {
			siteId: ownProps.siteId,
			postId: ownProps.postId,
		} ),
	} ),
	{
		followConversation,
		muteConversation,
	}
)( ConversationFollowButtonContainer );
