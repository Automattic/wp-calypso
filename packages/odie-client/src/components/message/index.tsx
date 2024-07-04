/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Gravatar } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Markdown from 'react-markdown';
import MaximizeIcon from '../../assets/maximize-icon.svg';
import MinimizeIcon from '../../assets/minimize-icon.svg';
import WapuuAvatar from '../../assets/wapuu-squared-avatar.svg';
import WapuuThinking from '../../assets/wapuu-thinking.svg';
import { useOdieAssistantContext } from '../../context';
import useTyper from '../../utils/user-typer';
import Button from '../button';
import FoldableCard from '../foldable';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { CurrentUser, Message, Source } from '../../types/';

import './style.scss';

export type ChatMessageProps = {
	message: Message;
	scrollToBottom: () => void;
	currentUser: CurrentUser;
};

const ChatMessage = (
	{ message, scrollToBottom, currentUser }: ChatMessageProps,
	ref: React.Ref< HTMLDivElement >
) => {
	const isUser = message.role === 'user';
	const { botName, extraContactOptions, addMessage, trackEvent } = useOdieAssistantContext();
	const [ scrolledToBottom, setScrolledToBottom ] = useState( false );
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const { __ } = useI18n();

	const realTimeMessage = useTyper( message.content, ! isUser && message.type === 'message', {
		delayBetweenCharacters: 66,
		randomDelayBetweenCharacters: true,
		charactersPerInterval: 5,
	} );

	const hasSources = message?.context?.sources && message.context?.sources.length > 0;
	const hasFeedback = !! message?.rating_value;

	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;

	// dedupe sources based on url
	let sources = message?.context?.sources ?? [];
	if ( sources.length > 0 ) {
		sources = [ ...new Map( sources.map( ( source ) => [ source.url, source ] ) ).values() ];
	}

	const isTypeMessageOrEmpty = ! message.type || message.type === 'message';
	const isSimulatedTypingFinished = message.simulateTyping && message.content === realTimeMessage;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const fullscreenRef = useRef< HTMLDivElement >( null );

	const messageFullyTyped =
		isTypeMessageOrEmpty && ( ! message.simulateTyping || isSimulatedTypingFinished );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	const messageClasses = clsx(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu'
	);

	const handleFullscreenToggle = () => {
		setIsFullscreen( ! isFullscreen );
	};

	const handleWheel = useCallback(
		( event: WheelEvent ) => {
			if ( ! isFullscreen ) {
				return;
			}

			const element = fullscreenRef.current;

			if ( element ) {
				const { scrollTop, scrollHeight, clientHeight } = element;
				const atTop = scrollTop <= 0;
				const tolerance = 2;
				const atBottom = scrollTop + clientHeight >= scrollHeight - tolerance;

				// Prevent scrolling the parent element when at the bounds
				if ( ( atTop && event.deltaY < 0 ) || ( atBottom && event.deltaY > 0 ) ) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		},
		[ isFullscreen ]
	);

	useEffect( () => {
		const fullscreenElement = fullscreenRef.current;
		if ( fullscreenElement ) {
			fullscreenElement.addEventListener( 'wheel', handleWheel, { passive: false } );
		}
		return () => {
			if ( fullscreenElement ) {
				fullscreenElement.removeEventListener( 'wheel', handleWheel );
			}
		};
	}, [ handleWheel ] );

	useEffect( () => {
		if ( message.content !== realTimeMessage && message.simulateTyping ) {
			scrollToBottom();
		}
	}, [ message, realTimeMessage, scrollToBottom ] );

	useEffect( () => {
		if ( messageFullyTyped && ! scrolledToBottom ) {
			scrollToBottom();
			setScrolledToBottom( true );
		}
	}, [ messageFullyTyped, scrolledToBottom, scrollToBottom ] );

	if ( ! currentUser || ! botName ) {
		return <div ref={ ref } />;
	}

	const wapuuAvatarClasses = clsx( 'odie-chatbox-message-avatar', {
		'odie-chatbox-message-avatar-wapuu-liked': message.liked,
	} );

	const messageAvatarHeader = isUser ? (
		<>
			<Gravatar
				user={ currentUser }
				size={ 32 }
				alt={ __( 'User profile display picture', __i18n_text_domain__ ) }
			/>
			<strong className="message-header-name">{ currentUser.display_name }</strong>
		</>
	) : (
		<>
			<img
				src={ WapuuAvatar }
				/* translators: %s is bot name, like Wapuu */
				alt={ sprintf( __( '%(botName)s profile picture', __i18n_text_domain__ ), botName ) }
				className={ wapuuAvatarClasses }
			/>
			{ message.type === 'placeholder' ? (
				<img
					src={ WapuuThinking }
					alt={ sprintf(
						/* translators: %s is bot name, like Wapuu */
						__( 'Loading state, awaiting response from %(botName)s', __i18n_text_domain__ ),
						botName
					) }
					className="odie-chatbox-thinking-icon"
				/>
			) : (
				<strong className="message-header-name">{ botName }</strong>
			) }

			<div className="message-header-buttons">
				{ message.content?.length > 600 && (
					<Button compact borderless onClick={ handleFullscreenToggle }>
						<img
							src={ isFullscreen ? MinimizeIcon : MaximizeIcon }
							alt={ sprintf(
								/* translators: %s is bot name, like Wapuu */
								__( 'Icon to expand or collapse %(botName)s messages', __i18n_text_domain__ ),
								botName
							) }
						/>
					</Button>
				) }
			</div>
		</>
	);

	const messageHeader = (
		<div className={ `message-header ${ isUser ? 'user' : 'bot' }` }>{ messageAvatarHeader }</div>
	);

	const shouldRenderExtraContactOptions = isRequestingHumanSupport && messageFullyTyped;

	const onDislike = () => {
		if ( shouldRenderExtraContactOptions ) {
			return;
		}
		setTimeout( () => {
			addMessage( {
				content: '...',
				role: 'bot',
				type: 'dislike-feedback',
			} );
		}, 1200 );
	};

	const odieChatBoxMessageSourcesContainerClass = clsx( 'odie-chatbox-message-sources-container', {
		'odie-chatbox-message-sources-container-fullscreen': isFullscreen,
	} );

	const messageContent = (
		<div className={ odieChatBoxMessageSourcesContainerClass } ref={ fullscreenRef }>
			<div className={ messageClasses }>
				{ messageHeader }
				{ message.type === 'error' && (
					<>
						<Markdown
							urlTransform={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{ message.content }
						</Markdown>
						{ extraContactOptions }
					</>
				) }
				{ ( message.type === 'message' || ! message.type ) && (
					<>
						<Markdown
							urlTransform={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{ isUser || ! message.simulateTyping ? message.content : realTimeMessage }
						</Markdown>
						{ ! hasFeedback && ! isUser && messageFullyTyped && (
							<WasThisHelpfulButtons message={ message } onDislike={ onDislike } />
						) }
						{ hasFeedback && messageFullyTyped && ! isPositiveFeedback && extraContactOptions }
						{ ! isUser && (
							<div className="disclaimer">
								{ __(
									"Generated by WordPress.com's Support AI. AI-generated responses may contain inaccurate information.",
									__i18n_text_domain__
								) }
								<ExternalLink href="https://automattic.com/ai-guidelines">
									{ ' ' }
									{ __( 'Learn more.', __i18n_text_domain__ ) }
								</ExternalLink>
							</div>
						) }
					</>
				) }
				{ message.type === 'introduction' && (
					<div className="odie-introduction-message-content">
						<div className="odie-chatbox-introduction-message">{ message.content }</div>
					</div>
				) }
				{ message.type === 'dislike-feedback' && (
					<>
						<Markdown
							urlTransform={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{
								/* translators: Message displayed when the user dislikes a message from the bot */
								__(
									'I’m sorry my last response didn’t meet your expectations! Here’s some other ways to get more in-depth help:',
									__i18n_text_domain__
								)
							}
						</Markdown>
						{ extraContactOptions }
					</>
				) }
				{ shouldRenderExtraContactOptions && extraContactOptions }
			</div>
			{ hasSources && messageFullyTyped && (
				<FoldableCard
					className="odie-sources-foldable-card"
					clickableHeader
					header={
						/* translators: Below this text are links to sources for the current message received from the bot. */
						__( 'Related Guides', __i18n_text_domain__ )
					}
					onClose={ () =>
						trackEvent( 'chat_message_action_sources', {
							action: 'close',
							message_id: message.message_id,
						} )
					}
					onOpen={ () =>
						trackEvent( 'chat_message_action_sources', {
							action: 'open',
							message_id: message.message_id,
						} )
					}
					screenReaderText="More"
				>
					<div className="odie-chatbox-message-sources">
						{ sources.length > 0 &&
							sources.map( ( source: Source, index: number ) => (
								<CustomALink key={ index } href={ source.url } inline={ false }>
									{ source?.title }
								</CustomALink>
							) ) }
					</div>
				</FoldableCard>
			) }
		</div>
	);

	const fullscreenContent = (
		<div className="odie-fullscreen" onClick={ handleBackdropClick }>
			<div className="odie-fullscreen-backdrop" onClick={ handleContentClick }>
				{ messageContent }
			</div>
		</div>
	);

	if ( isFullscreen ) {
		return (
			<>
				{ messageContent }
				{ ReactDOM.createPortal( fullscreenContent, document.body ) }
			</>
		);
	}
	return (
		<div className={ odieChatBoxMessageSourcesContainerClass } ref={ ref }>
			{ messageContent }
		</div>
	);
};

export default ChatMessage;
