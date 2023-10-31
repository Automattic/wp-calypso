/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from '@automattic/components';
import { useTyper } from '@automattic/help-center/src/hooks';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { RefObject, useState } from 'react';
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

type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	messageEndRef: RefObject< HTMLDivElement >;
};

const ChatMessage = ( { message, isLast, messageEndRef }: ChatMessageProps ) => {
	const isUser = message.role === 'user';
	const { botName } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const currentUser = useSelector( getCurrentUser );
	const translate = useTranslate();

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

	const realTimeMessage = useTyper( message.content, ! isUser && message.type === 'message', {
		delayBetweenCharacters: 66,
		randomDelayBetweenCharacters: true,
		charactersPerInterval: 5,
	} );

	const handleFullscreenToggle = () => {
		setIsFullscreen( ! isFullscreen );
	};

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
				{ message.type !== 'placeholder' && (
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

	const hasSources = message?.context?.sources && message.context?.sources.length > 0;
	const sources = message?.context?.sources ?? [];
	const isTypeMessageOrEmpty = ! message.type || message.type === 'message';
	const isSimulatedTypingFinished = message.simulateTyping && message.content === realTimeMessage;

	const messageFullyTyped =
		isTypeMessageOrEmpty && ( ! message.simulateTyping || isSimulatedTypingFinished );

	const messageContent = (
		<div ref={ isLast ? messageEndRef : null } className={ messageClasses }>
			{ messageHeader }
			{ ( message.type === 'message' || ! message.type ) && (
				<>
					<AsyncLoad
						require="react-markdown"
						placeholder={ null }
						transformLinkUri={ uriTransformer }
						components={ {
							a: CustomALink,
						} }
					>
						{ isUser || ! message.simulateTyping ? message.content : realTimeMessage }
					</AsyncLoad>
					{ hasSources && messageFullyTyped && (
						<div className="odie-chatbox-message-sources">
							<strong>
								{ translate( 'Sources:', {
									context:
										'Below this text are links to sources for the current message received from %(botName)s',
									textOnly: true,
									args: { botName },
								} ) }
							</strong>
							{ sources.map( ( source: Source, index: number ) => (
								<CustomALink key={ index } href={ source.url } inline={ false }>
									{ source?.title }
								</CustomALink>
							) ) }
						</div>
					) }

					{ ! isUser && <WasThisHelpfulButtons message={ message } /> }
				</>
			) }
			{ message.type === 'introduction' && (
				<div className="odie-introduction-message-content">
					<div className="odie-chatbox-introduction-message">{ message.content }</div>
				</div>
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
