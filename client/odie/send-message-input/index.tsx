import { useTranslate } from 'i18n-calypso';
import React, { useState, KeyboardEvent, FormEvent, useRef, useEffect } from 'react';
import ArrowUp from 'calypso/assets/images/odie/arrow-up.svg';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { WAPUU_ERROR_MESSAGE } from '..';
import { useOdieAssistantContext } from '../context';
import { JumpToRecent } from '../message/jump-to-recent';
import { useOdieSendMessage } from '../query';
import { Message } from '../types';

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
	const { addMessage, setIsLoading, botNameSlug, initialUserMessage, chat, isLoading } =
		useOdieAssistantContext();
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { siteId, siteDomain, currentRoute } = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) as number;
		const siteDomain = getSiteDomain( state, siteId ) as string;
		const currentRoute = getCurrentRoute( state );

		return {
			siteId,
			siteDomain,
			currentRoute,
		};
	} );

	useEffect( () => {
		if ( initialUserMessage && ! chat.chat_id ) {
			setMessageString( initialUserMessage );
		}
	}, [ initialUserMessage, chat.chat_id ] );

	/**
	 * Replaces route param values with placeholders, and returns the modified route path and route params.
	 * @param  {string}  route The route path
	 * @returns {string, Object} Object containing the modified route path and route params
	 */
	const replaceRouteParamsWithPlaceholders = ( route: string ) => {
		const routeParams = {} as Record< string, string >;

		route = route.replace( siteDomain, ':site' );
		routeParams.site = siteDomain;

		return { route, routeParams };
	};

	const buildContext = () => {
		const { route, routeParams } = replaceRouteParamsWithPlaceholders( currentRoute );

		return {
			blog_id: siteId,
			route: route,
			route_params: routeParams,
		};
	};

	const sendMessage = async () => {
		try {
			setIsLoading( true );

			dispatch(
				recordTracksEvent( 'calypso_odie_chat_message_action_send', {
					bot_name_slug: botNameSlug,
				} )
			);

			const context = buildContext();

			const message = {
				content: messageString,
				role: 'user',
				type: 'message',
				context,
			} as Message;

			addMessage( [
				message,
				{
					content: '...',
					role: 'bot',
					type: 'placeholder',
				},
			] );

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
				context: receivedMessage.messages[ 0 ].context,
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

	const divContainerHeight = divContainerRef?.current?.clientHeight;

	return (
		<>
			<JumpToRecent
				scrollToBottom={ scrollToRecent }
				enableJumpToRecent={ enableJumpToRecent }
				bottomOffset={ divContainerHeight ?? 0 }
			/>
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
