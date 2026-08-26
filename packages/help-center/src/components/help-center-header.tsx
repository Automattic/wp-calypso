/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useGetHistoryChats } from '@automattic/help-center/src/hooks/use-get-history-chats';
import { useCurrentSupportInteraction } from '@automattic/odie-client/src/data/use-current-support-interaction';
import {
	CardHeader,
	Button,
	Flex,
	__experimentalHStack as HStack,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useState } from '@wordpress/element';
import {
	lineSolid,
	moreVertical,
	close,
	chevronUp,
	check,
	Icon,
	comment,
	bell,
	backup,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureConfig, useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';
import { BackButton } from './back-button';
import type { Header } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-header.scss';

const MutedBellIcon = () => (
	<div style={ { position: 'relative', display: 'inline-block' } }>
		<Icon icon={ bell } width={ 24 } height={ 24 } />
		<svg
			style={ { position: 'absolute', top: 0, left: 0 } }
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
		>
			<path d="M2 22L22 2" stroke="#757575" strokeWidth="1.5" />
		</svg>
	</div>
);

type HelpCenterDisplayMode = 'sidebar' | 'floating';

const DISPLAY_MODE_STORAGE_KEY = 'help-center-display-mode';
export const DISPLAY_MODE_EVENT = 'help-center-display-mode';

const getStoredDisplayMode = (): HelpCenterDisplayMode =>
	typeof window !== 'undefined' &&
	window.localStorage.getItem( DISPLAY_MODE_STORAGE_KEY ) === 'floating'
		? 'floating'
		: 'sidebar';

// The outline rects carry an inline fill:none — host stylesheets set
// `svg { fill: currentColor }`, which overrides the presentation attribute
// and would turn the outline into a solid block.
const SidebarModeIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect
			x="4.25"
			y="6.25"
			width="15.5"
			height="11.5"
			rx="1.5"
			stroke="currentColor"
			strokeWidth="1.5"
			style={ { fill: 'none' } }
		/>
		<rect x="14.75" y="8.25" width="3" height="7.5" rx="0.5" style={ { fill: 'currentColor' } } />
	</svg>
);

const FloatingModeIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect
			x="4.25"
			y="6.25"
			width="15.5"
			height="11.5"
			rx="1.5"
			stroke="currentColor"
			strokeWidth="1.5"
			style={ { fill: 'none' } }
		/>
		<rect x="12.25" y="11.75" width="5.5" height="4" rx="0.5" style={ { fill: 'currentColor' } } />
	</svg>
);

// Keeps unchecked items' labels on the same vertical line as the checked one.
const menuIconSpacer = <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" />;

// Sidebar ↔ floating switch, Dia-style. Only offered when the host page
// supports the docked layout (the Multi-site Dashboard); the dashboard
// listens for the event and re-lays-out the page.
const DisplayModeMenu = () => {
	const { __ } = useI18n();
	const [ mode, setMode ] = useState< HelpCenterDisplayMode >( getStoredDisplayMode );

	const changeMode = ( next: HelpCenterDisplayMode ) => {
		setMode( next );
		window.localStorage.setItem( DISPLAY_MODE_STORAGE_KEY, next );
		window.dispatchEvent( new CustomEvent( DISPLAY_MODE_EVENT, { detail: next } ) );
	};

	return (
		<DropdownMenu
			icon={ mode === 'sidebar' ? <SidebarModeIcon /> : <FloatingModeIcon /> }
			label={ __( 'Display mode', __i18n_text_domain__ ) }
			popoverProps={ { inline: true } }
		>
			{ ( { onClose }: { onClose: () => void } ) => (
				<MenuGroup>
					<MenuItem
						icon={ mode === 'sidebar' ? check : menuIconSpacer }
						iconPosition="left"
						onClick={ () => {
							changeMode( 'sidebar' );
							onClose();
						} }
					>
						{ __( 'Sidebar', __i18n_text_domain__ ) }
					</MenuItem>
					<MenuItem
						icon={ mode === 'floating' ? check : menuIconSpacer }
						iconPosition="left"
						onClick={ () => {
							changeMode( 'floating' );
							onClose();
						} }
					>
						{ __( 'Floating', __i18n_text_domain__ ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

const EllipsisMenu = () => {
	const { __ } = useI18n();
	const navigate = useNavigate();
	const { recentConversations } = useGetHistoryChats();
	const { currentUser } = useHelpCenterContext();
	const isLoggedIn = !! currentUser?.ID;
	const { areSoundNotificationsEnabled } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			areSoundNotificationsEnabled: helpCenterSelect.getAreSoundNotificationsEnabled(),
		};
	}, [] );
	const { setAreSoundNotificationsEnabled, setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const clearChat = async () => {
		recordTracksEvent( 'calypso_inlinehelp_clear_conversation' );
		navigate( '/odie' );
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
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'Help Center Options', __i18n_text_domain__ ) }
			// Render the popover inside the panel node so opening the menu doesn't blur the panel
			popoverProps={ { inline: true } }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						<MenuItem
							icon={ lineSolid }
							iconPosition="left"
							onClick={ () => {
								setIsMinimized( true );
								onClose();
							} }
						>
							{ __( 'Minimize', __i18n_text_domain__ ) }
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							icon={ comment }
							iconPosition="left"
							onClick={ () => {
								clearChat();
								onClose();
							} }
						>
							{ __( 'New chat', __i18n_text_domain__ ) }
						</MenuItem>
						<MenuItem
							icon={ backup }
							iconPosition="left"
							onClick={ () => {
								handleViewChats();
								onClose();
							} }
						>
							{ __( 'Support history', __i18n_text_domain__ ) }
						</MenuItem>
					</MenuGroup>
					{ isLoggedIn && (
						<MenuGroup>
							<MenuItem
								icon={ areSoundNotificationsEnabled ? <MutedBellIcon /> : bell }
								iconPosition="left"
								onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
									toggleSoundNotifications( e );
									onClose();
								} }
							>
								{ areSoundNotificationsEnabled
									? __( 'Turn off sound notifications', __i18n_text_domain__ )
									: __( 'Turn on sound notifications', __i18n_text_domain__ ) }
							</MenuItem>
						</MenuGroup>
					) }
				</>
			) }
		</DropdownMenu>
	);
};

const useHeaderText = () => {
	const { __ } = useI18n();
	const { pathname } = useLocation();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();

	const isConversationWithZendesk = currentSupportInteraction?.events.some(
		( event ) => event.event_source === 'zendesk'
	);

	return useMemo( () => {
		switch ( pathname ) {
			case '/':
				return __( 'Help Center', __i18n_text_domain__ );
			case '/inline-chat':
				return __( 'Live Chat', __i18n_text_domain__ );
			case '/contact-form':
				return __( 'Send us an email', __i18n_text_domain__ );
			case '/post':
			case '/post/':
				return __( 'Support guide', __i18n_text_domain__ );
			case '/success':
				return __( 'Message Submitted', __i18n_text_domain__ );
			case '/odie':
				return isConversationWithZendesk
					? __( 'Support Team', __i18n_text_domain__ )
					: __( 'Support Assistant', __i18n_text_domain__ );
			case '/chat-history':
				return __( 'Support history', __i18n_text_domain__ );
			case '/support-guides':
				return __( 'Support guides', __i18n_text_domain__ );
			default:
				return __( 'Help Center', __i18n_text_domain__ );
		}
	}, [ __, isConversationWithZendesk, pathname ] );
};

const HeaderText = () => {
	const headerText = useHeaderText();
	const { unreadCount, isMinimized } = useSelect( ( select ) => {
		return {
			unreadCount: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
			isMinimized: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getIsMinimized(),
		};
	}, [] );

	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	return (
		<span id="header-text" role="presentation" className="help-center-header__text">
			{ headerText }
			{ unreadCount > 0 && isMinimized && (
				<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
			) }
		</span>
	);
};

const HelpCenterHeader = ( { onDismiss }: Header ) => {
	const { __ } = useI18n();
	const location = useLocation();
	const { setIsMinimized } = useDispatch( HELP_CENTER_STORE );

	const unreadCount = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
		[]
	);

	const { pathname } = useLocation();
	const { helpCenterOptions, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			helpCenterOptions: store.getHelpCenterOptions(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const featureConfig = useFeatureConfig();

	const classNames = clsx(
		'help-center__container-header',
		location?.pathname?.replace( /^\//, '' ),
		{
			'has-unread': unreadCount > 0 && isMinimized,
		}
	);

	const userAskingSupport =
		pathname.startsWith( '/odie' ) || pathname.startsWith( '/contact-form' );
	const isHelpCenterHome = pathname === '/';
	// Show the back button if it's not the help center home page and:
	// - it's a chat and the hideBackButton option is not set
	// - it's not a chat
	const shouldShowBackButton =
		! isHelpCenterHome &&
		( ( userAskingSupport && ! helpCenterOptions?.hideBackButton ) || ! userAskingSupport );

	if ( isMinimized ) {
		return (
			<button
				name={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
				className={ classNames }
				onClick={ () => setIsMinimized( false ) }
				aria-label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
			>
				<HStack alignment="center" justify="space-between" spacing={ 5 }>
					<HStack justify="flex-start">
						<HeaderText />
					</HStack>
					<Icon icon={ chevronUp } />
				</HStack>
			</button>
		);
	}

	const supportsDocking =
		typeof document !== 'undefined' && !! document.querySelector( '.dashboard-root__layout' );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				{ shouldShowBackButton ? <BackButton /> : null }
				<HeaderText />
				{ featureConfig.header.ellipsisMenu ? (
					<EllipsisMenu />
				) : (
					<Button
						label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
						tooltipPosition="top left"
						icon={ lineSolid }
						onClick={ () => setIsMinimized( true ) }
					/>
				) }
				{ supportsDocking && <DisplayModeMenu /> }

				<Button
					className="help-center-header__close"
					label={ __( 'Close Help Center', __i18n_text_domain__ ) }
					tooltipPosition="top left"
					icon={ close }
					onClick={ onDismiss }
				/>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
