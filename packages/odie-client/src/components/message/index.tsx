/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Gravatar } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Markdown from 'react-markdown';
import MaximizeIcon from '../../assets/maximize-icon.svg';
import MinimizeIcon from '../../assets/minimize-icon.svg';
import WapuuAvatar from '../../assets/wapuu-squared-avatar.svg';
import WapuuThinking from '../../assets/wapuu-thinking.svg';
import { useOdieAssistantContext } from '../../context';
import Button from '../button';
import FoldableCard from '../foldable';
import SupportDocLink from '../support-link';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { CurrentUser, Message } from '../../types/';

import './style.scss';

export type ChatMessageProps = {
	message: Message;
	currentUser: CurrentUser;
};

const ChatMessage = ( { message, currentUser }: ChatMessageProps ) => {
	const isUser = message.role === 'user';
	const {
		botName,
		extraContactOptions,
		addMessage,
		trackEvent,
		navigateToContactOptions,
		navigateToSupportDocs,
	} = useOdieAssistantContext();
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const { __, _x } = useI18n();

	const hasSources = message?.context?.sources && message.context?.sources.length > 0;
	const hasFeedback = !! message?.rating_value;

	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;

	// dedupe sources based on url
	let sources = message?.context?.sources ?? [];
	if ( sources.length > 0 ) {
		sources = [ ...new Map( sources.map( ( source ) => [ source.url, source ] ) ).values() ];
	}

	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const fullscreenRef = useRef< HTMLDivElement >( null );

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
		if ( isRequestingHumanSupport ) {
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

	const messageContent = (
		<div className="odie-chatbox-message-sources-container" ref={ fullscreenRef }>
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
							{ message.content }
						</Markdown>
						{ ! hasFeedback && ! isUser && (
							<WasThisHelpfulButtons message={ message } onDislike={ onDislike } />
						) }
						{ hasFeedback && ! isPositiveFeedback && extraContactOptions }
						{ ! isUser && (
							<>
								{ ( ! hasFeedback || ( hasFeedback && ! isPositiveFeedback ) ) && (
									<div className="disclaimer">
										{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
										<button
											onClick={ () => {
												trackEvent( 'chat_message_direct_escalation_link_click', {
													message_id: message.message_id,
												} );
												if ( navigateToContactOptions ) {
													navigateToContactOptions();
												}
											} }
											className="odie-button-link"
										>
											{ __( 'Contact our support team.', __i18n_text_domain__ ) }
										</button>
									</div>
								) }
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
							</>
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
									'I’m sorry my last response didn’t meet your expectations! Here’s some other ways to get more in-depth help:',
									'Message displayed when the user dislikes a message from the bot',
									__i18n_text_domain__
								)
							}
						</Markdown>
						{ extraContactOptions }
					</>
				) }
				{ isRequestingHumanSupport && extraContactOptions }
			</div>
			{ hasSources && (
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
							sources.map( ( source, index ) =>
								navigateToSupportDocs ? (
									<SupportDocLink
										key={ index }
										link={ source.url }
										onLinkClickHandler={ () => {
											trackEvent( 'chat_message_action_click', {
												action: 'link',
												in_chat_view: true,
												href: source.url,
											} );
											navigateToSupportDocs(
												String( source.blog_id ),
												String( source.post_id ),
												source.url,
												source.title
											);
										} }
										title={ source.title }
									/>
								) : (
									<CustomALink key={ index } href={ source.url } inline={ false }>
										{ source?.title }
									</CustomALink>
								)
							) }
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
	return messageContent;
};

export default ChatMessage;
