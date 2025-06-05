/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useGetHistoryChats } from '@automattic/help-center/src/hooks/use-get-history-chats';
import { EllipsisMenu } from '@automattic/odie-client';
import { clearHelpCenterZendeskConversationStarted } from '@automattic/odie-client/src/utils/storage-utils';
import { CardHeader, Button, Flex, ToggleControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useCallback, useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { _n } from '@wordpress/i18n';
import {
	closeSmall,
	chevronUp,
	lineSolid,
	scheduled,
	page,
	Icon,
	comment,
	commentContent,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { usePostByUrl } from '../hooks';
import { useResetSupportInteraction } from '../hooks/use-reset-support-interaction';
import { DragIcon } from '../icons';
import { HELP_CENTER_STORE } from '../stores';
import { BackButton } from './back-button';
import type { Header } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-header.scss';

export function ArticleTitle() {
	const { __ } = useI18n();
	const [ searchParams ] = useSearchParams();
	const postUrl = searchParams.get( 'link' ) || '';

	const { data: post } = usePostByUrl( postUrl );

	return (
		<>
			<Icon icon={ page } />
			<span className="help-center-header__article-title">
				{ ( post && decodeEntities( post?.title ) ) ?? __( 'Help Center', __i18n_text_domain__ ) }
			</span>
		</>
	);
}

const SupportModeTitle = () => {
	const { __ } = useI18n();
	const { search } = useLocation();
	const params = new URLSearchParams( search );

	const mode = params.get( 'mode' );
	switch ( mode ) {
		case 'CHAT':
			return (
				<>
					<Icon icon={ commentContent } />
					{ __( 'Contact WordPress.com Support', __i18n_text_domain__ ) }
				</>
			);
		case 'EMAIL': {
			return <>{ __( 'Send us an email', __i18n_text_domain__ ) }</>;
		}
		case 'FORUM': {
			return <>{ __( 'Ask in our community forums', __i18n_text_domain__ ) }</>;
		}
		default: {
			return <>{ __( 'Help Center', __i18n_text_domain__ ) }</>;
		}
	}
};

const ChatEllipsisMenu = () => {
	const { __ } = useI18n();
	const resetSupportInteraction = useResetSupportInteraction();
	const navigate = useNavigate();
	const { recentConversations } = useGetHistoryChats();
	const { areSoundNotificationsEnabled } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			areSoundNotificationsEnabled: helpCenterSelect.getAreSoundNotificationsEnabled(),
		};
	}, [] );
	const { setAreSoundNotificationsEnabled } = useDispatch( HELP_CENTER_STORE );

	const clearChat = async () => {
		await resetSupportInteraction();
		clearHelpCenterZendeskConversationStarted();
		recordTracksEvent( 'calypso_inlinehelp_clear_conversation' );
	};

	const handleViewChats = () => {
		recordTracksEvent( 'calypso_inlinehelp_view_open_chats_menu', {
			total_number_of_conversations: recentConversations.length,
		} );

		navigate( '/chat-history' );
	};

	const toggleSoundNotifications = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		setAreSoundNotificationsEnabled( ! areSoundNotificationsEnabled );
	};

	return (
		<EllipsisMenu
			popoverClassName="help-center help-center__container-header-menu"
			position="bottom"
			trackEventProps={ { source: 'help_center' } }
		>
			<div className="conversation-menu__wrapper">
				<button onClick={ clearChat }>
					<Icon icon={ comment } />
					<div>{ __( 'New chat', __i18n_text_domain__ ) }</div>
				</button>
				<button onClick={ handleViewChats } disabled={ recentConversations.length < 2 }>
					<Icon icon={ scheduled } />
					<div>
						{ _n(
							'View recent chat',
							'View recent chats',
							recentConversations.length,
							__i18n_text_domain__
						) }
					</div>
				</button>
				<button onClick={ toggleSoundNotifications }>
					<ToggleControl
						className="conversation-menu__notification-toggle"
						label={ __( 'Notification sound', __i18n_text_domain__ ) }
						checked={ areSoundNotificationsEnabled }
						onChange={ ( newValue ) => {
							setAreSoundNotificationsEnabled( newValue );
						} }
						__nextHasNoMarginBottom
					/>
				</button>
			</div>
		</EllipsisMenu>
	);
};

const useHeaderText = () => {
	const { __ } = useI18n();
	const { pathname } = useLocation();
	const [ isConversationWithZendesk, setIsConversationWithZendesk ] = useState< boolean >( false );
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	useEffect( () => {
		if ( currentSupportInteraction ) {
			const zendeskEvent = currentSupportInteraction?.events.find(
				( event ) => event.event_source === 'zendesk'
			);
			setIsConversationWithZendesk( !! zendeskEvent );
		}
	}, [ currentSupportInteraction ] );

	return useMemo( () => {
		switch ( pathname ) {
			case '/':
				return __( 'Help Center', __i18n_text_domain__ );
			case '/contact-options':
				return __( 'Contact Options', __i18n_text_domain__ );
			case '/inline-chat':
				return __( 'Live Chat', __i18n_text_domain__ );
			case '/contact-form':
				return <SupportModeTitle />;
			case '/post':
			case '/post/':
				return <ArticleTitle />;
			case '/success':
				return __( 'Message Submitted', __i18n_text_domain__ );
			case '/odie':
				return isConversationWithZendesk
					? __( 'Support Team', __i18n_text_domain__ )
					: __( 'Support Assistant', __i18n_text_domain__ );
			case '/chat-history':
				return __( 'History', __i18n_text_domain__ );
			default:
				return __( 'Help Center', __i18n_text_domain__ );
		}
	}, [ __, isConversationWithZendesk, pathname ] );
};

const HeaderText = () => {
	const headerText = useHeaderText();
	return (
		<span id="header-text" role="presentation" className="help-center-header__text">
			{ headerText }
		</span>
	);
};

const Content = ( { onMinimize }: { onMinimize?: () => void } ) => {
	const { __ } = useI18n();
	const { pathname } = useLocation();

	const { helpCenterOptions } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			helpCenterOptions: store.getHelpCenterOptions(),
		};
	}, [] );

	const isChat = pathname.startsWith( '/odie' );
	const isHelpCenterHome = pathname === '/';
	// Show the back button if it's not the help center home page and:
	// - it's a chat and the hideBackButton option is not set
	// - it's not a chat
	const shouldShowBackButton =
		! isHelpCenterHome && ( ( isChat && ! helpCenterOptions?.hideBackButton ) || ! isChat );

	return (
		<>
			{ shouldShowBackButton ? <BackButton /> : <DragIcon /> }
			<HeaderText />
			{ isChat && <ChatEllipsisMenu /> }
			<Button
				className="help-center-header__minimize"
				label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
				icon={ lineSolid }
				tooltipPosition="top left"
				onClick={ () => onMinimize?.() }
				onTouchStart={ () => onMinimize?.() }
			/>
		</>
	);
};

const ContentMinimized = ( {
	unreadCount = 0,
	handleClick,
	onMaximize,
}: {
	unreadCount: number;
	handleClick?: ( event: React.SyntheticEvent ) => void;
	onMaximize?: () => void;
} ) => {
	const { __ } = useI18n();
	const headerText = useHeaderText();
	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	return (
		<>
			<p
				id="header-text"
				className="help-center-header__text"
				onClick={ handleClick }
				onKeyUp={ handleClick }
				role="presentation"
			>
				{ headerText }
				{ unreadCount > 0 && (
					<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
				) }
			</p>
			<Button
				className="help-center-header__maximize"
				label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
				icon={ chevronUp }
				tooltipPosition="top left"
				onClick={ onMaximize }
				onTouchStart={ onMaximize }
			/>
		</>
	);
};

const HelpCenterHeader = ( { isMinimized = false, onMinimize, onMaximize, onDismiss }: Header ) => {
	const { __ } = useI18n();
	const location = useLocation();

	const unreadCount = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
		[]
	);

	const handleClick = useCallback( () => {
		if ( isMinimized ) {
			onMaximize?.();
		}
	}, [ onMaximize, isMinimized ] );

	const classNames = clsx(
		'help-center__container-header',
		location?.pathname?.replace( /^\//, '' ),
		{
			'has-unread': unreadCount > 0 && isMinimized,
		}
	);

	return (
		<CardHeader className={ classNames }>
			<Flex onClick={ handleClick }>
				{ isMinimized ? (
					<ContentMinimized
						unreadCount={ unreadCount }
						handleClick={ handleClick }
						onMaximize={ onMaximize }
					/>
				) : (
					<Content onMinimize={ onMinimize } />
				) }
				<Button
					className="help-center-header__close"
					label={ __( 'Close Help Center', __i18n_text_domain__ ) }
					tooltipPosition="top left"
					icon={ closeSmall }
					onClick={ onDismiss }
					onTouchStart={ onDismiss }
				/>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
