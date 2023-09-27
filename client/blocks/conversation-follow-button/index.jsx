import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followConversation, muteConversation } from 'calypso/state/reader/conversations/actions';
import { isFollowingReaderConversation } from 'calypso/state/reader/conversations/selectors';
import ConversationFollowButton from './button';

import './style.scss';

const noop = () => {};

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		post: PropTypes.object, // for stats only
		followSource: PropTypes.string,
		followIcon: PropTypes.object,
		followingIcon: PropTypes.object,
	};

	static defaultProps = {
		onFollowToggle: noop,
		followIcon: null,
		followingIcon: null,
	};

	handleFollowToggle = ( isRequestingFollow ) => {
		const { siteId, postId, post, followSource } = this.props;

		const tracksProperties = {
			follow_source: followSource,
		};

		if ( isRequestingFollow ) {
			this.props.recordReaderTracksEvent(
				'calypso_reader_conversations_post_followed',
				tracksProperties,
				{ post }
			);
			this.props.followConversation( { siteId, postId } );
		} else {
			this.props.recordReaderTracksEvent(
				'calypso_reader_conversations_post_muted',
				tracksProperties,
				{ post }
			);
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
				followIcon={ this.props.followIcon }
				followingIcon={ this.props.followingIcon }
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
		recordReaderTracksEvent,
	}
)( ConversationFollowButtonContainer );
