/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { EllipsisMenu } from '@automattic/odie-client';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { clearHelpCenterZendeskConversationStarted } from '@automattic/odie-client/src/utils/storage-utils';
import { CardHeader, Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo, useCallback, useEffect, useState } from '@wordpress/element';
import { closeSmall, chevronUp, lineSolid, commentContent, page, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
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
				{ ( post && post?.title ) ?? __( 'Help Center', __i18n_text_domain__ ) }
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
	const { startNewInteraction } = useManageSupportInteraction();

	const clearChat = async () => {
		await resetSupportInteraction();
		startNewInteraction( {
			event_source: 'help-center',
			event_external_id: uuidv4(),
		} );
		clearHelpCenterZendeskConversationStarted();
	};

	return (
		<EllipsisMenu
			popoverClassName="help-center help-center__container-header-menu"
			position="bottom"
		>
			<PopoverMenuItem
				onClick={ clearChat }
				className="help-center help-center__container-header-menu-item"
			>
				<Gridicon icon="comment" />
				{ __( 'Clear Conversation' ) }
			</PopoverMenuItem>
		</EllipsisMenu>
	);
};

const HeaderText = () => {
	const { __ } = useI18n();
	const { pathname } = useLocation();
	const [ isConversationWithZendesk, setIsConversationWithZendesk ] = useState< boolean >( false );
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const shouldUseHelpCenterExperience = config.isEnabled( 'help-center-experience' );

	useEffect( () => {
		if ( currentSupportInteraction ) {
			const zendeskEvent = currentSupportInteraction?.events.find(
				( event ) => event.event_source === 'zendesk'
			);
			if ( zendeskEvent ) {
				setIsConversationWithZendesk( true );
			} else {
				setIsConversationWithZendesk( false );
			}
		}
	}, [ currentSupportInteraction ] );

	const headerText = useMemo( () => {
		const getOdieHeader = () => {
			if ( shouldUseHelpCenterExperience ) {
				return isConversationWithZendesk
					? __( 'Support Team', __i18n_text_domain__ )
					: __( 'Support Assistant', __i18n_text_domain__ );
			}
			return __( 'Wapuu', __i18n_text_domain__ );
		};

		switch ( pathname ) {
			case '/odie':
				return getOdieHeader();
			case '/contact-form':
				return shouldUseHelpCenterExperience
					? __( 'Support Assistant', __i18n_text_domain__ )
					: __( 'Wapuu', __i18n_text_domain__ );
			case '/chat-history':
				return __( 'History', __i18n_text_domain__ );
			default:
				return __( 'Help Center', __i18n_text_domain__ );
		}
	}, [ __, isConversationWithZendesk, pathname, shouldUseHelpCenterExperience ] );

	return (
		<span id="header-text" role="presentation" className="help-center-header__text">
			{ headerText }
		</span>
	);
};

const Content = ( { onMinimize }: { onMinimize?: () => void } ) => {
	const { __ } = useI18n();
	const { pathname } = useLocation();

	const shouldUseHelpCenterExperience = config.isEnabled( 'help-center-experience' );
	const shouldDisplayClearChatButton =
		shouldUseHelpCenterExperience && pathname.startsWith( '/odie' );
	const isHelpCenterHome = pathname === '/';

	return (
		<>
			{ isHelpCenterHome ? <DragIcon /> : <BackButton /> }
			<HeaderText />
			{ shouldDisplayClearChatButton && <ChatEllipsisMenu /> }
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
				<Routes>
					<Route path="/" element={ __( 'Help Center', __i18n_text_domain__ ) } />
					<Route
						path="/contact-options"
						element={ __( 'Contact Options', __i18n_text_domain__ ) }
					/>
					<Route path="/inline-chat" element={ __( 'Live Chat', __i18n_text_domain__ ) } />
					<Route path="/contact-form" element={ <SupportModeTitle /> } />
					<Route path="/post" element={ <ArticleTitle /> } />
					<Route path="/success" element={ __( 'Message Submitted', __i18n_text_domain__ ) } />
					<Route
						path="/odie"
						element={
							config.isEnabled( 'help-center-experience' )
								? __( 'Support Assistant', __i18n_text_domain__ )
								: __( 'Wapuu', __i18n_text_domain__ )
						}
					/>
					<Route path="/chat-history" element={ __( 'History', __i18n_text_domain__ ) } />
				</Routes>
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

	const handleClick = useCallback(
		( event: React.SyntheticEvent ) => {
			if ( event.target === event.currentTarget ) {
				onMaximize?.();
			}
		},
		[ onMaximize ]
	);

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
