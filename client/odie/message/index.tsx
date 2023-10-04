/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button, Gridicon } from '@automattic/components';
import { useTyper } from '@automattic/help-center/src/hooks';
import { Spinner } from '@wordpress/components';
import { Icon, page as pageIcon } from '@wordpress/icons';
import classnames from 'classnames';
import { RefObject, useState } from 'react';
import ReactDOM from 'react-dom';
import CustomerChatTail from 'calypso/assets/images/odie/customer-chatbubble-tail.svg';
import WapuuAvatar from 'calypso/assets/images/odie/wapuu-avatar.svg';
import WapuuChatTail from 'calypso/assets/images/odie/wapuu-chatbubble-tail.svg';
import AsyncLoad from 'calypso/components/async-load';
import { useOdieAssistantContext } from '../context';
import CustomALink from './custom-a-link';
import { LikeDislikeButtons } from './like-dislike-buttons';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../types';

import './style.scss';

type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	messageEndRef: RefObject< HTMLDivElement >;
};

const ChatMessage = ( { message, isLast, messageEndRef }: ChatMessageProps ) => {
	const isUser = message.role === 'user';
	const { addMessage: sendOdieMessage, botName } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	const messageClasses = classnames(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu',
		{
			'odie-full-width-message': message.type === 'help-link' || message.type === 'placeholder',
			'odie-introduction-message': message.type === 'introduction',
			'odie-simulate-typing': message.simulateTyping,
		}
	);

	const handleHelpLinkClick = async () => {
		await sendOdieMessage( {
			role: 'user',
			type: 'message',
			content: message.meta?.message ?? '',
		} );
	};

	const realTimeMessage = useTyper( message.content, ! isUser && message.type === 'message', {
		delayBetweenCharacters: 66,
		randomDelayBetweenCharacters: true,
		charactersPerInterval: 5,
	} );

	const handleFullscreenToggle = () => {
		setIsFullscreen( ! isFullscreen );
	};

	const messageContent = (
		<div ref={ isLast ? messageEndRef : null } className={ messageClasses }>
			{ message.type !== 'introduction' && ! isUser && (
				<div className="message-header">
					<strong className="message-header-name">{ botName }</strong>
					<div className="message-header-buttons">
						<Button compact borderless onClick={ handleFullscreenToggle }>
							<Gridicon icon={ isFullscreen ? 'fullscreen-exit' : 'fullscreen' } size={ 18 } />
						</Button>
					</div>
				</div>
			) }
			{ message.type === 'placeholder' && <Spinner /> }
			{ message.type === 'message' && (
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
					<LikeDislikeButtons isUser={ isUser } messageType={ message.type } />
				</>
			) }
			{ message.type === 'help-link' && (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div className="odie-chatbox-help-link" onClick={ handleHelpLinkClick }>
					<Icon
						className="odie-chatbox-message-help-icon"
						width={ 32 }
						height={ 32 }
						icon={ pageIcon }
					/>
					<div className="odie-chatbox-help-link__content">{ message.content }</div>
				</div>
			) }
			{ message.type === 'introduction' && (
				<div className="odie-introduction-message-content">
					<img src={ WapuuAvatar } alt="Wapuu profile" className="odie-chatbox-message-avatar" />
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

	const isBubbleType = [ 'message', 'introduction', 'placeholder', 'help-link' ].includes(
		message.type
	);

	const messageContentWithTail = (
		<>
			{ messageContent }
			{ isBubbleType && ! isUser && (
				<img
					src={ WapuuChatTail }
					className="odie-chatbox-message-wapuu-tail"
					alt="Customer chat tail"
				/>
			) }
			{ isBubbleType && isUser && (
				<img
					src={ CustomerChatTail }
					className="odie-chatbox-message-customer-tail"
					alt="Wapuu chat tail"
				/>
			) }
		</>
	);

	return isFullscreen
		? ReactDOM.createPortal( fullscreenContent, document.body )
		: messageContentWithTail;
};

export default ChatMessage;
