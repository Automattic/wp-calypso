/*
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { assign, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ConversationFollowButton from './button';
import { isFollowingReaderConversation } from 'state/reader/conversations/selectors';
import { followConversation, muteConversation } from 'state/reader/conversations/actions';
import { getTracksPropertiesForPost } from 'reader/stats';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		post: PropTypes.object, // for stats only
		followSource: PropTypes.string,
	};

	static defaultProps = {
		onFollowToggle: noop,
	};

	handleFollowToggle = ( isRequestingFollow ) => {
		const { siteId, postId, post, followSource } = this.props;

		const tracksProperties = assign( getTracksPropertiesForPost( post ), {
			follow_source: followSource,
		} );

		if ( isRequestingFollow ) {
			this.props.recordTracksEvent(
				'calypso_reader_conversations_post_followed',
				tracksProperties
			);
			this.props.followConversation( { siteId, postId } );
		} else {
			this.props.recordTracksEvent( 'calypso_reader_conversations_post_muted', tracksProperties );
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
		recordTracksEvent,
	}
)( ConversationFollowButtonContainer );
