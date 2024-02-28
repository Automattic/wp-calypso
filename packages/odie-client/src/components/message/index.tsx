/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
import type { Message, Source } from '../../types';

import './style.scss';

// This is due to the AsyncLoad component. The initial scroll is not working properly, due to
// the fact that the AsyncLoad component is not rendering the children immediately. In order to solve that
// we know that the placeholder component will be unmounted when the AsyncLoad component has finished loading.
const ComponentLoadedReporter = ( { callback }: { callback: () => void } ) => {
	useEffect( () => {
		return callback;
	}, [ callback ] );

	return null;
};

export type ChatMessageProps = {
	message: Message;
	scrollToBottom: () => void;
};

const ChatMessage = (
	{ message, scrollToBottom }: ChatMessageProps,
	ref: React.Ref< HTMLDivElement >
) => {
	const isUser = message.role === 'user';
	const { botName, extraContactOptions, addMessage, trackEvent } = useOdieAssistantContext();
	const [ scrolledToBottom, setScrolledToBottom ] = useState( false );
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const currentUser = useSelector( getCurrentUser );
	const translate = useTranslate();

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

	const messageClasses = classnames(
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

	const wapuuAvatarClasses = classnames( 'odie-chatbox-message-avatar', {
		'odie-chatbox-message-avatar-wapuu-liked': message.liked,
	} );

	const messageAvatarHeader = isUser ? (
		<>
			<Gravatar
				user={ currentUser }
				size={ 32 }
				alt={ translate( 'User profile display picture', {
					context: 'html alt tag',
					textOnly: true,
				} ) }
			/>
			<strong className="message-header-name">{ currentUser.display_name }</strong>
		</>
	) : (
		<>
			<img
				src={ WapuuAvatar }
				alt={ translate( '%(botName)s profile picture', {
					context: 'html alt tag',
					textOnly: true,
					args: { botName },
				} ) }
				className={ wapuuAvatarClasses }
			/>
			{ message.type === 'placeholder' ? (
				<img
					src={ WapuuThinking }
					alt={ translate( 'Loading state, awaiting response from %(botName)s', {
						context: 'html alt tag',
						textOnly: true,
						args: { botName },
					} ) }
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
							alt={ translate( 'Icon to expand or collapse %(botName)s messages', {
								context: 'html alt tag',
								textOnly: true,
								args: { botName },
							} ) }
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

	const odieChatBoxMessageSourcesContainerClass = classnames(
		'odie-chatbox-message-sources-container',
		{
			'odie-chatbox-message-sources-container-fullscreen': isFullscreen,
		}
	);

	const messageContent = (
		<div className={ odieChatBoxMessageSourcesContainerClass } ref={ fullscreenRef }>
			<div className={ messageClasses }>
				{ messageHeader }
				{ message.type === 'error' && (
					<>
						<AsyncLoad
							require="react-markdown"
							placeholder={ <ComponentLoadedReporter callback={ scrollToBottom } /> }
							transformLinkUri={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{ message.content }
						</AsyncLoad>
						{ extraContactOptions }
					</>
				) }
				{ ( message.type === 'message' || ! message.type ) && (
					<>
						<AsyncLoad
							require="react-markdown"
							placeholder={ <ComponentLoadedReporter callback={ scrollToBottom } /> }
							transformLinkUri={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{ isUser || ! message.simulateTyping ? message.content : realTimeMessage }
						</AsyncLoad>
						{ ! hasFeedback && ! isUser && messageFullyTyped && (
							<WasThisHelpfulButtons message={ message } onDislike={ onDislike } />
						) }
						{ hasFeedback && messageFullyTyped && ! isPositiveFeedback && extraContactOptions }
					</>
				) }
				{ message.type === 'introduction' && (
					<div className="odie-introduction-message-content">
						<div className="odie-chatbox-introduction-message">{ message.content }</div>
					</div>
				) }
				{ message.type === 'dislike-feedback' && (
					<>
						<AsyncLoad
							require="react-markdown"
							placeholder={ <ComponentLoadedReporter callback={ scrollToBottom } /> }
							transformLinkUri={ uriTransformer }
							components={ {
								a: CustomALink,
							} }
						>
							{ translate(
								'I’m sorry my last response didn’t meet your expectations! Here’s some other ways to get more in-depth help:',
								{
									context: 'Message displayed when the user dislikes a message from the bot',
									textOnly: true,
								}
							) }
						</AsyncLoad>
						{ extraContactOptions }
					</>
				) }
				{ shouldRenderExtraContactOptions && extraContactOptions }
			</div>
			{ hasSources && messageFullyTyped && (
				<FoldableCard
					className="odie-sources-foldable-card"
					clickableHeader
					header={ translate( 'Related Guides', {
						context:
							'Below this text are links to sources for the current message received from the bot.',
						textOnly: true,
					} ) }
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
