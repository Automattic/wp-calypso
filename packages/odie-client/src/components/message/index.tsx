/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { HumanAvatar, WapuuAvatar } from '../../assets';
import { useOdieAssistantContext } from '../../context';
import { MessageContent } from './message-content';
import type { CurrentUser, Message } from '../../types';
import './style.scss';

export type ChatMessageProps = {
	message: Message;
	currentUser: CurrentUser;
	displayChatWithSupportLabel?: boolean;
	isNextMessageFromSameSender: boolean;
};

export type MessageIndicators = {
	isLastUserMessage: boolean;
	isLastFeedbackMessage: boolean;
	isLastErrorMessage: boolean;
	isLastMessage: boolean;
};

const MessageAvatarHeader = ( { message }: { message: Message } ) => {
	return message.role === 'bot' ? (
		<WapuuAvatar />
	) : (
		message.role === 'business' && (
			<HumanAvatar title={ __( 'User Avatar', __i18n_text_domain__ ) } />
		)
	);
};

const ChatMessage = ( {
	message,
	currentUser,
	displayChatWithSupportLabel,
	isNextMessageFromSameSender,
}: ChatMessageProps ) => {
	const isBot = message.role === 'bot';
	const { botName } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const [ isDisliked ] = useState( false );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	if ( ! currentUser || ! botName ) {
		return null;
	}

	const messageHeader = (
		<div className={ `message-header ${ isBot ? 'bot' : 'business' }` }>
			<MessageAvatarHeader message={ message } />
		</div>
	);

	const fullscreenContent = (
		<div className="help-center-experience-disabled">
			<div className="odie-fullscreen" onClick={ handleBackdropClick }>
				<div className="odie-fullscreen-backdrop" onClick={ handleContentClick }>
					<MessageContent
						message={ message }
						messageHeader={ messageHeader }
						isDisliked={ isDisliked }
					/>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<MessageContent
				message={ message }
				messageHeader={ messageHeader }
				isDisliked={ isDisliked }
				displayChatWithSupportLabel={ displayChatWithSupportLabel }
				isNextMessageFromSameSender={ isNextMessageFromSameSender }
			/>
			{ isFullscreen && ReactDOM.createPortal( fullscreenContent, document.body ) }
		</>
	);
};

export default ChatMessage;
