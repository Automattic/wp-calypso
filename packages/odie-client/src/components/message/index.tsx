/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Gravatar } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { HumanAvatar, WapuuAvatar } from '../../assets';
import MaximizeIcon from '../../assets/maximize-icon.svg';
import MinimizeIcon from '../../assets/minimize-icon.svg';
import WapuuAvatarSquared from '../../assets/wapuu-squared-avatar.svg';
import { useOdieAssistantContext } from '../../context';
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

const MessageAvatarHeader = ( {
	currentUser,
	message,
	wapuuAvatarClasses,
	isFullscreen,
	handleFullscreenToggle,
}: {
	message: Message;
	currentUser: CurrentUser;
	wapuuAvatarClasses: string;
	isFullscreen: boolean;
	handleFullscreenToggle: () => void;
} ) => {
	const isMobile = useMobileBreakpoint();
	const { botName, shouldUseHelpCenterExperience } = useOdieAssistantContext();

	if ( shouldUseHelpCenterExperience ) {
		return message.role === 'bot' ? (
			<>
				<WapuuAvatar className={ wapuuAvatarClasses } />
				<strong className="message-header-name"></strong>

				<div className="message-header-buttons">
					{ message.content?.length > 600 && ! isMobile && (
						<Button compact borderless onClick={ handleFullscreenToggle }>
							<img
								src={ isFullscreen ? MinimizeIcon : MaximizeIcon }
								alt={ __( 'Icon to expand or collapse AI messages', __i18n_text_domain__ ) }
							/>
						</Button>
					) }
				</div>
			</>
		) : (
			<>{ message.role === 'business' && <HumanAvatar /> }</>
		);
	}

	return message.role === 'user' ? (
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
				src={ WapuuAvatarSquared }
				alt={ __( 'AI profile picture', __i18n_text_domain__ ) }
				className={ wapuuAvatarClasses }
			/>
			<strong className="message-header-name">{ botName }</strong>
			<div className="message-header-buttons">
				{ message.content?.length > 600 && ! isMobile && (
					<Button compact borderless onClick={ handleFullscreenToggle }>
						<img
							src={ isFullscreen ? MinimizeIcon : MaximizeIcon }
							alt={ __( 'Icon to expand or collapse AI messages', __i18n_text_domain__ ) }
						/>
					</Button>
				) }
			</div>
		</>
	);
};

const ChatMessage = ( {
	message,
	currentUser,
	...messageIndicators
}: ChatMessageProps & MessageIndicators ) => {
	const isBot = message.role === 'bot';
	const { botName } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const [ isDisliked ] = useState( false );

	const fullscreenRef = useRef< HTMLDivElement >( null );

	const handleBackdropClick = () => {
		setIsFullscreen( false );
	};

	const handleFullscreenToggle = () => {
		setIsFullscreen( ! isFullscreen );
	};

	const handleContentClick = ( event: MouseEvent | React.MouseEvent< HTMLDivElement > ) => {
		event.stopPropagation();
	};

	if ( ! currentUser || ! botName ) {
		return null;
	}

	const wapuuAvatarClasses = clsx( 'odie-chatbox-message-avatar', {
		'odie-chatbox-message-avatar-wapuu-liked': message.liked,
	} );

	const messageHeader = (
		<div className={ `message-header ${ isBot ? 'bot' : 'business' }` }>
			<MessageAvatarHeader
				currentUser={ currentUser }
				isFullscreen={ isFullscreen }
				handleFullscreenToggle={ handleFullscreenToggle }
				message={ message }
				wapuuAvatarClasses={ wapuuAvatarClasses }
			/>
		</div>
	);

	const fullscreenContent = (
		<div className="odie-fullscreen" onClick={ handleBackdropClick }>
			<div className="odie-fullscreen-backdrop" onClick={ handleContentClick }>
				<MessageContent
					message={ message }
					messageHeader={ messageHeader }
					ref={ fullscreenRef }
					isDisliked={ isDisliked }
					{ ...messageIndicators }
				/>
			</div>
		</div>
	);

	return (
		<>
			<MessageContent
				message={ message }
				messageHeader={ messageHeader }
				ref={ fullscreenRef }
				isDisliked={ isDisliked }
				{ ...messageIndicators }
			/>
			{ isFullscreen && ReactDOM.createPortal( fullscreenContent, document.body ) }
		</>
	);
};

export default ChatMessage;
