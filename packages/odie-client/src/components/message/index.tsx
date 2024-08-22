/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Gravatar } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import MaximizeIcon from '../../assets/maximize-icon.svg';
import MinimizeIcon from '../../assets/minimize-icon.svg';
import WapuuAvatar from '../../assets/wapuu-squared-avatar.svg';
import WapuuThinking from '../../assets/wapuu-thinking.svg';
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
	const isUser = message.role === 'user';
	const { botName, addMessage } = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const { _x } = useI18n();
	const [ isDisliked, setIsDisliked ] = useState( false );

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

	const wapuuAvatarClasses = clsx( 'odie-chatbox-message-avatar', {
		'odie-chatbox-message-avatar-wapuu-liked': message.liked,
	} );

	const messageAvatarHeader = isUser ? (
		<>
			<Gravatar
				user={ currentUser }
				size={ 32 }
				alt={ _x( 'User profile display picture', 'html alt tag', __i18n_text_domain__ ) }
			/>
			<strong className="message-header-name">{ currentUser.display_name }</strong>
		</>
	) : (
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

	const messageHeader = (
		<div className={ `message-header ${ isUser ? 'user' : 'bot' }` }>{ messageAvatarHeader }</div>
	);

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
