import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { ChatFeedback } from '../../types';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';
import type { KeyboardEvent } from 'react';

type FeedbackThumbsProps = {
	chatFeedbackOptions: ChatFeedback[];
};

export const FeedbackThumbs = ( { chatFeedbackOptions }: FeedbackThumbsProps ) => {
	const { chat } = useOdieAssistantContext();
	const { __ } = useI18n();
	const text = __( 'Was this helpful?' );
	const [ hasScore, setScore ] = useState( false );
	const [ content, setContent ] = useState( '' );
	const [ finishedRating, setFinishedRating ] = useState( false );

	const ratingConversation = ( score: 'GOOD' | 'BAD' ) => {
		const index = score === 'GOOD' ? 0 : 1;
		try {
			if ( ! chat?.conversationId ) {
				return;
			}
			Smooch.sendMessage(
				{
					type: 'text',
					text: score,
					payload: chatFeedbackOptions[ index ].payload,
					metadata: chatFeedbackOptions[ index ].metadata,
				},
				chat.conversationId
			);

			setScore( true );
		} catch ( error ) {
			// console.error( 'Error sending rating:', error );
		}
	};

	const sendScoreComment = () => {
		if ( ! chat?.conversationId || ! chat?.messages?.length ) {
			return;
		}
		// Necessary to submit the comment to the correct message type ( form )
		const lastMessage = chat.messages[ chat.messages.length - 1 ];
		Smooch.sendMessage(
			{
				type: 'formResponse',
				fields: [
					{
						type: 'text',
						name: 'csat_comment',
						label: 'Tell us what you think:',
						text: content,
					},
				],
				quotedMessageId: lastMessage?.quotedMessageId,
				role: 'appUser',
			},
			chat.conversationId
		);
		setFinishedRating( true );
	};

	const setFeedbackContent = ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
		setContent( ( event.target as HTMLTextAreaElement ).value );
	};

	if ( finishedRating ) {
		return null;
	}

	return (
		<>
			<div
				className={ clsx( 'odie-conversation__feedback', {
					has_message: hasScore,
				} ) }
			>
				<div className="odie-conversation-feedback__text">
					<p>{ text }</p>
				</div>
				<div className="odie-conversation-feedback__thumbs">
					<Button onClick={ () => ratingConversation( 'GOOD' ) } rel="noreferrer">
						<ThumbsUpIcon />
					</Button>
					<Button onClick={ () => ratingConversation( 'BAD' ) } rel="noreferrer">
						<ThumbsDownIcon />
					</Button>
				</div>
			</div>
			{ hasScore && (
				<div className="odie-conversation-feedback__message">
					<div>
						<h3>{ __( 'Thank you for your input!' ) }</h3>
						<p>{ __( 'Please share any other details that can help understand your rating.' ) }</p>
					</div>
					<div>
						<textarea onKeyUp={ setFeedbackContent } />
						<button className="components-button is-primary" onClick={ sendScoreComment }>
							{ __( 'Send' ) }
						</button>
						<button
							onClick={ () => setFinishedRating( true ) }
							className="components-button is-secondary"
						>
							{ __( 'No thanks' ) }
						</button>
					</div>
				</div>
			) }
		</>
	);
};
