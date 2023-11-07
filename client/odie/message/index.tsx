/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button, FoldableCard } from '@automattic/components';
import { useTyper } from '@automattic/help-center/src/hooks';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import MaximizeIcon from 'calypso/assets/images/odie/maximize-icon.svg';
import MinimizeIcon from 'calypso/assets/images/odie/minimize-icon.svg';
import WapuuAvatar from 'calypso/assets/images/odie/wapuu-squared-avatar.svg';
import WapuuThinking from 'calypso/assets/images/odie/wapuu-thinking.svg';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useOdieAssistantContext } from '../context';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message, Source } from '../types';

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

type ChatMessageProps = {
	message: Message;
	scrollToBottom: () => void;
};

const ChatMessage = ( { message, scrollToBottom }: ChatMessageProps ) => {
	const isUser = message.role === 'user';
	const { botName, extraContactOptions } = useOdieAssistantContext();
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
	const sources = message?.context?.sources ?? [];
	const isTypeMessageOrEmpty = ! message.type || message.type === 'message';
	const isSimulatedTypingFinished = message.simulateTyping && message.content === realTimeMessage;
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;

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
		return;
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

	const messageContent = (
		<div className="odie-chatbox-message-sources-container">
			<div className={ messageClasses }>
				{ messageHeader }
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
							<WasThisHelpfulButtons message={ message } />
						) }
					</>
				) }
				{ message.type === 'introduction' && (
					<div className="odie-introduction-message-content">
						<div className="odie-chatbox-introduction-message">{ message.content }</div>
					</div>
				) }
				{ isRequestingHumanSupport && extraContactOptions }
			</div>
			{ hasSources && messageFullyTyped && (
				<FoldableCard
					header={ translate( 'Sources:', {
						context:
							'Below this text are links to sources for the current message received from the bot.',
						textOnly: true,
					} ) }
					screenReaderText="More"
					onClick={ scrollToBottom }
				>
					<div className="odie-chatbox-message-sources">
						{ sources.map( ( source: Source, index: number ) => (
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
			<div onClick={ handleContentClick }>{ messageContent }</div>
		</div>
	);

	return isFullscreen ? ReactDOM.createPortal( fullscreenContent, document.body ) : messageContent;
};

export default ChatMessage;
