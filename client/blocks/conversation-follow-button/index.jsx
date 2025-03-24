import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { followConversation, muteConversation } from 'calypso/state/reader/conversations/actions';
import { isFollowingReaderConversation } from 'calypso/state/reader/conversations/selectors';
import { removeItemFromStream } from 'calypso/state/reader/streams/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
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
		const { siteId, postId, post, followSource, currentRoute } = this.props;

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

			// If we're in the conversations stream, remove this post from the stream
			if ( currentRoute.startsWith( '/reader/conversations' ) ) {
				const postKey = {
					blogId: siteId,
					postId: postId,
				};

				const streamKey = currentRoute.startsWith( '/reader/conversations/a8c' )
					? 'conversations-a8c'
					: 'conversations';

				this.props.removeItemFromStream( {
					streamKey,
					postKey,
				} );
			}
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
		currentRoute: getCurrentRoute( state ),
	} ),
	{
		followConversation,
		muteConversation,
		recordReaderTracksEvent,
		removeItemFromStream,
	}
)( ConversationFollowButtonContainer );
