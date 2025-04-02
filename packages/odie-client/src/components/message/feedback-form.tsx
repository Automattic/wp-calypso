import { HelpCenterSelect } from '@automattic/data-stores/src/help-center/types';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useRateChat, useAuthenticateZendeskMessaging } from '@automattic/zendesk-client';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState, useCallback } from 'react';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { MessageAction } from '../../types';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';
import type { KeyboardEvent } from 'react';

type MessagePayload = {
	type: 'text' | 'formResponse';
	text?: string;
	payload?: string;
	metadata?: Record< string, any >;
	fields?: Array< {
		type: 'text';
		name: string;
		label: string;
		text: string;
	} >;
	quotedMessageId?: string;
	role: 'appUser';
};

type FeedbackFormProps = {
	chatFeedbackOptions: MessageAction[];
};

export const FeedbackForm = ( { chatFeedbackOptions }: FeedbackFormProps ) => {
	const { chat, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const user = Smooch.getUser();
	const { __ } = useI18n();
	const [ score, setScore ] = useState< 'GOOD' | 'BAD' | '' >( '' );
	const [ comment, setComment ] = useState( '' );
	const [ finishedRating, setFinishedRating ] = useState( false );

	const { mutateAsync: rateChat } = useRateChat();

	const { zendeskClientId } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			zendeskClientId: helpCenterSelect.getZendeskClientId(),
		};
	}, [] );
	const { data: authData } = useAuthenticateZendeskMessaging(
		isUserEligibleForPaidSupport,
		'messenger'
	);

	const inferredClientId = chat.clientId || zendeskClientId;
	const lastMessage = chat?.messages?.[ chat?.messages.length - 1 ];

	const generateMessage = ( {
		type,
		score,
		comment,
		quotedMessageId,
		accountId,
		ticketID,
	}: {
		type: 'text' | 'formResponse';
		score?: 'GOOD' | 'BAD';
		comment?: string;
		quotedMessageId?: string;
		accountId?: number;
		ticketID?: number;
	} ): MessagePayload | null => {
		if ( type === 'text' ) {
			const textValue = score === 'GOOD' ? 'Good 👍' : 'Bad 👎';
			return {
				type: 'text',
				text: textValue,
				payload: JSON.stringify( { csat_rating: score } ),
				metadata: {
					rated: true,
					score,
					account_id: accountId,
					ticket_id: ticketID,
				},
				role: 'appUser',
			};
		} else if ( type === 'formResponse' ) {
			return {
				type: 'formResponse',
				fields: [
					{
						type: 'text',
						name: 'csat_comment',
						label: 'Tell us what you think:',
						text: comment || '',
					},
				],
				quotedMessageId: quotedMessageId,
				role: 'appUser',
			};
		}
		return null;
	};

	const ratingConversation = ( score: 'GOOD' | 'BAD' ) => {
		if ( ! chat?.conversationId || ! chat?.messages?.length || ! authData ) {
			return;
		}

		const index = score === 'GOOD' ? 0 : 1;

		const ticketID = chatFeedbackOptions[ index ]?.metadata?.ticket_id;
		const accountId = chatFeedbackOptions[ index ]?.metadata?.account_id;

		const message = generateMessage( {
			type: 'text',
			score,
			accountId,
			ticketID,
		} );

		if ( ! message ) {
			return;
		}

		rateChat( {
			authData,
			conversationId: chat.conversationId,
			clientId: inferredClientId,
			appUserId: user.id,
			message,
		} ).then( () => setScore( score ) );
	};

	const sendScoreComment = () => {
		if ( ! chat?.conversationId || ! chat?.messages?.length || ! authData ) {
			return;
		}

		const message = generateMessage( {
			type: 'formResponse',
			comment,
			quotedMessageId: lastMessage?.quotedMessageId,
		} );

		if ( ! message ) {
			return;
		}

		rateChat( {
			authData,
			conversationId: chat.conversationId,
			clientId: inferredClientId,
			appUserId: user.id,
			message,
		} ).then( () => setFinishedRating( true ) );
	};

	const setFeedbackContent = useCallback( ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
		setComment( ( event.target as HTMLTextAreaElement ).value );
	}, [] );

	if ( finishedRating ) {
		return (
			<div className="feedback-thankyou__message">
				{ __( 'Your feedback has been sent. Thank you for helping us improve.' ) }
			</div>
		);
	}

	return (
		<>
			<div className={ clsx( 'odie-conversation__feedback', { has_message: score } ) }>
				<div className="odie-conversation-feedback__text">
					<p>{ __( 'Was this helpful?' ) }</p>
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
			{ score && (
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
