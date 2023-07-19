import classnames from 'classnames';
import { useReducer } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

type LikeStatus = 'like' | 'dislike' | null;
type LikeAction = { type: 'like' | 'dislike' };

function reducer( state: LikeStatus, action: LikeAction ) {
	if ( action.type === 'like' ) {
		return state === 'like' ? null : 'like';
	}
	if ( action.type === 'dislike' ) {
		return state === 'dislike' ? null : 'dislike';
	}
	throw Error( 'Unknown action.' );
}

type LikeDislikeButtonsProps = {
	isUser: boolean;
	messageType: string;
};

const LikeDislikeButtons = ( { isUser, messageType }: LikeDislikeButtonsProps ) => {
	const [ likeStatus, dispatch ] = useReducer( reducer, null );
	const trackDispatcher = useDispatch();

	const like = () => {
		dispatch( { type: 'like' } );
		trackDispatcher(
			recordTracksEvent( 'calypso_odie_chat_message_rating', {
				bot_name_slug: 'wapuu',
				rating: 'like',
			} )
		);
	};
	const dislike = () => {
		dispatch( { type: 'dislike' } );
		trackDispatcher(
			recordTracksEvent( 'calypso_odie_chat_message_rating', {
				bot_name_slug: 'wapuu',
				rating: 'dislike',
			} )
		);
	};

	if ( isUser || messageType === 'error' ) {
		return null;
	}

	return (
		<div className="odie-chatbox-message-actions">
			<button
				aria-label="Like this message"
				className={ classnames( 'odie-chatbox-message-action', 'dashicons', {
					'dashicons-thumbs-up': true,
					'odie-chatbox-message-active-like': likeStatus === 'like',
					'odie-chatbox-message-hide': likeStatus === 'dislike',
				} ) }
				disabled={ likeStatus !== null }
				onClick={ like }
			></button>
			<button
				aria-label="Dislike this message"
				className={ classnames( 'odie-chatbox-message-action', 'dashicons', {
					'dashicons-thumbs-down': true,
					'odie-chatbox-message-active-dislike': likeStatus === 'dislike',
					'odie-chatbox-message-hide': likeStatus === 'like',
				} ) }
				disabled={ likeStatus !== null }
				onClick={ dislike }
			></button>
		</div>
	);
};

export { LikeDislikeButtons };
