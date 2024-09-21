/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { HumanAvatar, WapuuSquaredAvatar } from '../../assets';
import MaximizeIcon from '../../assets/maximize-icon.svg';
import MinimizeIcon from '../../assets/minimize-icon.svg';
import { useOdieAssistantContext } from '../../context';
import { uuid } from '../../query';
import Button from '../button';
import { MessageContent } from './message-content';
import type { CurrentUser, Message } from '../../types/';

import './style.scss';

export type ChatMessageProps = {
	message: Message;
	currentUser: CurrentUser;
};

export type MessageIndicators = {
	isLastUserMessage: boolean;
	isLastFeedbackMessage: boolean;
	isLastErrorMessage: boolean;
	isLastMessage: boolean;
};

const ChatMessage = ( props: ChatMessageProps & MessageIndicators ) => {
	const { message, currentUser, ...messageIndicators } = props;
	const isBot = message.role === 'bot';
	const { botName, addMessage } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const { _x } = useI18n();
	const [ isDisliked, setIsDisliked ] = useState( false );
	const isMobile = useMobileBreakpoint();

	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const fullscreenRef = useRef< HTMLDivElement >( null );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	const handleFullscreenToggle = () => {
		setIsFullscreen( ! isFullscreen );
	};

	if ( ! currentUser || ! botName ) {
		return null;
	}

	const messageAvatarHeader =
		message.role !== 'user' &&
		( isBot ? (
			<WapuuSquaredAvatar />
		) : (
			<>
				<HumanAvatar />
				<div className="message-header-buttons">
					{ message.content?.length > 600 && ! isMobile && (
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
		) );

	const messageHeader = <div className="message-header bot">{ messageAvatarHeader }</div>;

	const onDislike = () => {
		setIsDisliked( true );
		if ( isRequestingHumanSupport || isDisliked ) {
			return;
		}
		setTimeout( () => {
			addMessage( {
				internal_message_id: uuid(),
				content: '...',
				role: 'bot',
				type: 'dislike-feedback',
			} );
		}, 1200 );
	};

	const fullscreenContent = (
		<div className="odie-fullscreen" onClick={ handleBackdropClick }>
			<div className="odie-fullscreen-backdrop" onClick={ handleContentClick }>
				<MessageContent
					message={ message }
					messageHeader={ messageHeader }
					onDislike={ onDislike }
					ref={ fullscreenRef }
					isDisliked={ isDisliked }
					{ ...messageIndicators }
				/>
			</div>
		</div>
	);

	if ( isFullscreen ) {
		return (
			<>
				<MessageContent
					message={ message }
					messageHeader={ messageHeader }
					onDislike={ onDislike }
					ref={ fullscreenRef }
					isDisliked={ isDisliked }
					{ ...messageIndicators }
				/>
				{ ReactDOM.createPortal( fullscreenContent, document.body ) }
			</>
		);
	}
	return (
		<MessageContent
			message={ message }
			messageHeader={ messageHeader }
			onDislike={ onDislike }
			ref={ fullscreenRef }
			isDisliked={ isDisliked }
			{ ...messageIndicators }
		/>
	);
};

export default ChatMessage;
