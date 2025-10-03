/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { useOdieAssistantContext } from '../../context';
import { MessageContent } from './message-content';
import type { CurrentUser, Message } from '../../types';
import './style.scss';

export type ChatMessageProps = {
	message: Message;
	currentUser: CurrentUser;
	displayChatWithSupportLabel?: boolean;
	displayCSAT?: boolean;
	header?: React.ReactNode;
};

export type MessageIndicators = {
	isLastUserMessage: boolean;
	isLastFeedbackMessage: boolean;
	isLastErrorMessage: boolean;
	isLastMessage: boolean;
};

const ChatMessage = ( { message, currentUser, header }: ChatMessageProps ) => {
	const { botName } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	if ( ! currentUser || ! botName ) {
		return null;
	}

	const fullscreenContent = (
		<div className="help-center-experience-disabled">
			<div className="odie-fullscreen" onClick={ handleBackdropClick }>
				<div className="odie-fullscreen-backdrop" onClick={ handleContentClick }>
					<MessageContent message={ message } />
				</div>
			</div>
		</div>
	);

	return (
		<>
			<MessageContent message={ message } header={ header } />
			{ isFullscreen && ReactDOM.createPortal( fullscreenContent, document.body ) }
		</>
	);
};

export default ChatMessage;
