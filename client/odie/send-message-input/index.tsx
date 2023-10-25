import { useTranslate } from 'i18n-calypso';
import React, { useState, KeyboardEvent, FormEvent, useRef } from 'react';
import ArrowUp from 'calypso/assets/images/odie/arrow-up.svg';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { WAPUU_ERROR_MESSAGE } from '..';
import { useOdieAssistantContext } from '../context';
import { JumpToRecent } from '../message/jump-to-recent';
import { useOdieSendMessage } from '../query';
import { Message } from '../types';

import './style.scss';

export const OdieSendMessageButton = ( {
	bottomRef,
}: {
	bottomRef: React.MutableRefObject< HTMLDivElement | null >;
} ) => {
	const [ messageString, setMessageString ] = useState< string >( '' );
	const divContainerRef = useRef< HTMLDivElement >( null );
	const { addMessage, setIsLoading, botNameSlug } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const sendMessage = async () => {
		try {
			setIsLoading( true );

			dispatch(
				recordTracksEvent( 'calypso_odie_chat_message_action_send', {
					bot_name_slug: botNameSlug,
				} )
			);

			const message = {
				content: messageString,
				role: 'user',
				type: 'message',
			} as Message;

			addMessage( message );

			addMessage( {
				content: '...',
				role: 'bot',
				type: 'placeholder',
			} );

			const receivedMessage = await sendOdieMessage( { message } );
			dispatch(
				recordTracksEvent( 'calypso_odie_chat_message_action_receive', {
					bot_name_slug: botNameSlug,
				} )
			);

			addMessage( {
				content: receivedMessage.messages[ 0 ].content,
				role: 'bot',
				simulateTyping: receivedMessage.messages[ 0 ].simulateTyping,
				type: 'message',
			} );
		} catch ( e ) {
			addMessage( {
				content: WAPUU_ERROR_MESSAGE,
				role: 'bot',
				type: 'error',
			} );
		} finally {
			setIsLoading( false );
		}
	};

	const sendMessageIfNotEmpty = async () => {
		if ( messageString.trim() === '' ) {
			return;
		}
		bottomRef?.current?.scrollIntoView( { behavior: 'smooth' } );
		await sendMessage();
		setMessageString( '' );
		bottomRef?.current?.scrollIntoView( { behavior: 'smooth' } );
	};

	const handleKeyPress = async ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
		bottomRef?.current?.scrollIntoView( { behavior: 'instant' } );
		if ( event.key === 'Enter' && ! event.shiftKey ) {
			event.preventDefault();
			await sendMessageIfNotEmpty();
		}
	};

	const handleButtonClick = async () => {
		await sendMessageIfNotEmpty();
	};

	const handleSubmit = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( messageString.trim() === '' ) {
			return;
		}
		await sendMessage();
		setMessageString( '' );
	};

	const divContainerHeight = divContainerRef?.current?.clientHeight;

	return (
		<>
			<JumpToRecent lastMessageRef={ bottomRef } bottomOffset={ divContainerHeight ?? 0 } />
			<div className="odie-chat-message-input-container" ref={ divContainerRef }>
				<form onSubmit={ handleSubmit } className="odie-send-message-input-container">
					<TextareaAutosize
						placeholder={ translate( 'Ask your question', {
							context: 'Placeholder text for the message input field (chat)',
							textOnly: true,
						} ) }
						className="odie-send-message-input"
						rows={ 1 }
						value={ messageString }
						onChange={ ( event: React.ChangeEvent< HTMLTextAreaElement > ) =>
							setMessageString( event.currentTarget.value )
						}
						onKeyPress={ handleKeyPress }
					/>
					<button
						type="submit"
						className="odie-send-message-inner-button"
						onClick={ handleButtonClick }
						disabled={ messageString.trim() === '' }
					>
						<img
							src={ ArrowUp }
							alt={ translate( 'Arrow icon', {
								context: 'html alt tag',
								textOnly: true,
							} ) }
						/>
					</button>
				</form>
			</div>
		</>
	);
};
