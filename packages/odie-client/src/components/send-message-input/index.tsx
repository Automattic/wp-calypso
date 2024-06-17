/* eslint-disable no-restricted-imports */
import { useTranslate } from 'i18n-calypso';
import React, { useState, KeyboardEvent, FormEvent, useRef, useEffect } from 'react';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import ArrowUp from '../../assets/arrow-up.svg';
import { useOdieAssistantContext } from '../../context';
import { useOdieSendMessage } from '../../query';
import { Message } from '../../types';
import { JumpToRecent } from '../message/jump-to-recent';

import './style.scss';

export const OdieSendMessageButton = ( {
	scrollToRecent,
	scrollToBottom,
	enableStickToBottom,
	enableJumpToRecent,
}: {
	scrollToRecent: () => void;
	scrollToBottom: ( force?: boolean ) => void;
	enableStickToBottom: () => void;
	enableJumpToRecent: boolean;
} ) => {
	const [ messageString, setMessageString ] = useState< string >( '' );
	const divContainerRef = useRef< HTMLDivElement >( null );
	const { initialUserMessage, chat, isLoading, trackEvent } = useOdieAssistantContext();
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const translate = useTranslate();

	useEffect( () => {
		if ( initialUserMessage && ! chat.chat_id ) {
			setMessageString( initialUserMessage );
		}
	}, [ initialUserMessage, chat.chat_id ] );

	const sendMessage = async () => {
		try {
			trackEvent( 'chat_message_action_send' );

			const message = {
				content: messageString,
				role: 'user',
				type: 'message',
			} as Message;

			await sendOdieMessage( { message } );

			trackEvent( 'chat_message_action_receive' );
		} catch ( e ) {
			const error = e as Error;
			trackEvent( 'chat_message_error', {
				error: error?.message,
			} );
		}
	};

	const sendMessageIfNotEmpty = async () => {
		if ( messageString.trim() === '' ) {
			return;
		}
		setMessageString( '' );
		enableStickToBottom();
		await sendMessage();
		scrollToBottom( true );
	};

	const handleKeyPress = async ( event: KeyboardEvent< HTMLTextAreaElement > ) => {
		scrollToBottom( false );
		if ( isLoading ) {
			return;
		}
		if ( event.key === 'Enter' && ! event.shiftKey ) {
			event.preventDefault();
			await sendMessageIfNotEmpty();
		}
	};

	const handleSubmit = async ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		await sendMessageIfNotEmpty();
	};

	const userHasAskedToContactHE = chat.messages.some(
		( message ) => message.context?.flags?.forward_to_human_support === true
	);
	const userHasNegativeFeedback = chat.messages.some( ( message ) => message.liked === false );

	return (
		<>
			<JumpToRecent scrollToBottom={ scrollToRecent } enableJumpToRecent={ enableJumpToRecent } />
			<div className="odie-chat-message-input-container" ref={ divContainerRef }>
				<form onSubmit={ handleSubmit } className="odie-send-message-input-container">
					<TextareaAutosize
						placeholder={
							userHasAskedToContactHE || userHasNegativeFeedback
								? translate( 'Continue chatting with Wapuu', {
										context: 'Placeholder text for the message input field (chat)',
										textOnly: true,
								  } )
								: translate( 'Ask your question', {
										context: 'Placeholder text for the message input field (chat)',
										textOnly: true,
								  } )
						}
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
						disabled={ messageString.trim() === '' || isLoading }
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
