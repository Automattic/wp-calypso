/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Gravatar } from '@automattic/components';
import { useHelpCenterMessenger } from '@automattic/help-center/src/components/help-center-messenger';
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
import AgentAvatar from '../../assets/wordpress-agent-avatar.svg';
import { useOdieAssistantContext } from '../../context';
import { getConversationMetadada } from '../../utils/conversation-utils';
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
	const isAgent = message.role === 'agent';
	const { chat, botName, extraContactOptions, addMessage, trackEvent } = useOdieAssistantContext();
	const { createConversation } = useHelpCenterMessenger();
	const [ scrolledToBottom, setScrolledToBottom ] = useState( false );
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const { __, _x } = useI18n();

	const realTimeMessage = useTyper(
		message.content,
		! ( isUser || isAgent ) && message.type === 'message',
		{
			delayBetweenCharacters: 66,
			randomDelayBetweenCharacters: true,
			charactersPerInterval: 5,
		}
	);

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

	let messageAvatarHeader;
	switch ( message.role ) {
		case 'user':
			messageAvatarHeader = (
				<>
					<Gravatar
						user={ currentUser }
						size={ 32 }
						alt={ _x( 'User profile display picture', 'html alt tag', __i18n_text_domain__ ) }
					/>
					<strong className="message-header-name">{ currentUser.display_name }</strong>
				</>
			);
			break;
		case 'agent':
			messageAvatarHeader = (
				<>
					<img
						src={ AgentAvatar }
						alt={ _x( 'Support agent profile picture', 'html alt tag', __i18n_text_domain__ ) }
						className={ wapuuAvatarClasses }
					/>
					<strong className="message-header-name">
						{ _x( 'WordPress.com Support', 'Support message header', __i18n_text_domain__ ) }
					</strong>
				</>
			);
			break;
		case 'bot':
		default:
			messageAvatarHeader = (
				<>
					<img
						src={ WapuuAvatar }
						alt={ sprintf(
							/* translators: %s is bot name, like Wapuu */
							_x( '%(botName)s profile picture', 'html alt tag', __i18n_text_domain__ ),
							botName
						) }
						className={ wapuuAvatarClasses }
					/>
					{ message.type === 'placeholder' ? (
						<img
							src={ WapuuThinking }
							alt={ sprintf(
								/* translators: %s is bot name, like Wapuu */
								_x(
									'Loading state, awaiting response from %(botName)s',
									'html alt tag',
									__i18n_text_domain__
								),
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
										_x(
											'Icon to expand or collapse %(botName)s messages',
											'html alt tag',
											__i18n_text_domain__
										),
										botName
									) }
								/>
							</Button>
						) }
					</div>
				</>
			);
	}

	let messageHeaderClass = 'message-header';
	if ( isUser ) {
		messageHeaderClass += ' user';
	} else if ( isAgent ) {
		messageHeaderClass += ' agent';
	} else {
		messageHeaderClass += ' bot';
	}

	const messageHeader = <div className={ messageHeaderClass }>{ messageAvatarHeader }</div>;

	const shouldRenderExtraContactOptions = isRequestingHumanSupport && messageFullyTyped;

	const onDislike = () => {
		if ( chat.type === 'human' ) {
			return;
		}
		createConversation( getConversationMetadada( chat.chat_id ) );
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
							{ isUser || isAgent || ! message.simulateTyping ? message.content : realTimeMessage }
						</Markdown>
						{ ! hasFeedback && ! ( isUser || isAgent ) && messageFullyTyped && (
							<WasThisHelpfulButtons message={ message } onDislike={ onDislike } />
						) }
						{ hasFeedback && messageFullyTyped && ! isPositiveFeedback && extraContactOptions }
						{ ! ( isUser || isAgent ) && (
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
								_x(
									"I’m sorry my last response didn’t meet your expectations! I've sent your request to my human friends. They will get back to you soon.",
									'Message displayed when the user dislikes a message from the bot',
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
						_x(
							'Related Guides',
							'Below this text are links to sources for the current message received from the bot.',
							__i18n_text_domain__
						)
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
