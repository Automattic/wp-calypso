import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

// Admin bar element selectors
const ADMIN_BAR_BUTTON_ID = 'wp-admin-bar-agents-manager';
const ADMIN_BAR_CHAT_ITEM_ID = 'wp-admin-bar-agents-manager-chat-support';
const ADMIN_BAR_HISTORY_ITEM_ID = 'wp-admin-bar-agents-manager-chat-history';
const ADMIN_BAR_GUIDES_ITEM_ID = 'wp-admin-bar-agents-manager-support-guides';

// The standalone AI chat button — the chat's entry point, separate from the Help
// menu. The wp-admin bar exposes it by ID; Calypso's masterbar by class.
const ADMIN_BAR_AI_CHAT_BUTTON_ID = 'wp-admin-bar-agents-manager-ai-chat';
const MASTERBAR_AI_CHAT_BUTTON_SELECTOR = '.masterbar__item-agents-manager-ai-chat';

/**
 * Whether the AI chat button (wp-admin bar or Calypso masterbar) is present.
 * If so, the chat hides on close and reopens from it instead of a floating bubble.
 */
export function hasAiChatEntryButton(): boolean {
	return (
		!! document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID ) ||
		!! document.querySelector( MASTERBAR_AI_CHAT_BUTTON_SELECTOR )
	);
}

// CSS class name
const OPEN_CLICK_CLASS = 'open-click';

// Tracking event destinations
const DESTINATION_CHAT = 'agents-manager-chat';
const DESTINATION_HISTORY = 'agents-manager-history';
const DESTINATION_GUIDES = 'agents-manager-support-guides';

interface UseAdminBarIntegrationOptions {
	maybeOpenChat: () => void;
	closeChat: () => void;
}

/**
 * Custom hook to handle WordPress admin bar integration for agents-manager
 *
 * Manages:
 * - Help menu panel toggle visibility
 * - Click outside to close the menu
 * - Menu item and AI chat button click handlers with tracking
 *
 * Returns whether the AI chat entry button is present on the page.
 */
export default function useAdminBarIntegration( {
	maybeOpenChat,
	closeChat,
}: UseAdminBarIntegrationOptions ): boolean {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { resumeActiveChat, sectionName } = useAgentsManagerContext();
	const { isOpen, isMinimized } = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getAgentsManagerState(),
		[]
	);

	// Refs keep the latest callbacks without re-attaching DOM listeners each render.
	const maybeOpenChatRef = useRef( maybeOpenChat );
	maybeOpenChatRef.current = maybeOpenChat;
	const closeChatRef = useRef( closeChat );
	closeChatRef.current = closeChat;
	const resumeActiveChatRef = useRef( resumeActiveChat );
	resumeActiveChatRef.current = resumeActiveChat;

	// Whether the AI chat entry button is present (captured once on mount).
	const [ hasAiChatEntry ] = useState( hasAiChatEntryButton );

	// Whether the chat is visible (open and not minimized), read inside the
	// one-time DOM click handlers below to decide whether a click opens or closes.
	const isChatVisibleRef = useRef( false );
	isChatVisibleRef.current = isOpen && ! isMinimized;

	// The chat's current route, read inside those same handlers so a Help menu item
	// only closes the chat when it targets the route already showing.
	const currentRouteRef = useRef( pathname );
	currentRouteRef.current = pathname;

	// Toggle the Help button's dropdown menu when it is clicked.
	useEffect( () => {
		const button = document.getElementById( ADMIN_BAR_BUTTON_ID );

		const handleMenuPanelClick = () => {
			// Track icon interaction
			recordTracksEvent( 'wpcom_help_center_icon_interaction', {
				is_help_center_visible: isOpen,
				section: sectionName || 'wp-admin',
				is_menu_panel_enabled: false,
				is_assignment_loaded: true,
			} );

			// Track the toggle action
			recordTracksEvent( `calypso_inlinehelp_${ isOpen ? 'close' : 'show' }`, {
				force_site_id: true,
				location: 'help-center',
				section: sectionName || 'wp-admin',
			} );

			// Toggle submenu visibility by toggling the open-click class
			button?.classList.toggle( OPEN_CLICK_CLASS );
		};

		if ( button ) {
			button.onclick = handleMenuPanelClick;
		}
	}, [ isOpen, sectionName ] );

	// Close submenu when clicking outside
	useEffect( () => {
		const button = document.getElementById( ADMIN_BAR_BUTTON_ID );

		const handleClickOutside = ( event: MouseEvent ) => {
			if ( button && ! button.contains( event.target as Node ) ) {
				button.classList.remove( OPEN_CLICK_CLASS );
			}
		};

		document.addEventListener( 'click', handleClickOutside );
		return () => {
			document.removeEventListener( 'click', handleClickOutside );
		};
	}, [] );

	// The standalone AI button toggles the chat: close it if it's already showing,
	// otherwise resume the active conversation and open it.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		const handleClick = () => {
			recordTracksEvent( 'calypso_admin_bar_agents_manager_ai_chat_clicked', {
				section: sectionName || 'wp-admin',
				action: isChatVisibleRef.current ? 'close' : 'open',
			} );
			if ( isChatVisibleRef.current ) {
				closeChatRef.current();
				return;
			}
			resumeActiveChatRef.current();
			maybeOpenChatRef.current();
		};

		aiChatButton.addEventListener( 'click', handleClick );
		return () => aiChatButton.removeEventListener( 'click', handleClick );
	}, [ sectionName ] );

	// Wire each Help menu item's click: track it, then open or close the chat.
	useEffect( () => {
		const menuItems = [
			// Chat Support resumes the active conversation, matching the AI button.
			{
				id: ADMIN_BAR_CHAT_ITEM_ID,
				destination: DESTINATION_CHAT,
				route: '/chat',
				action: () => resumeActiveChatRef.current(),
			},
			{
				id: ADMIN_BAR_HISTORY_ITEM_ID,
				destination: DESTINATION_HISTORY,
				route: '/history',
				action: () => navigate( '/history' ),
			},
			{
				id: ADMIN_BAR_GUIDES_ITEM_ID,
				destination: DESTINATION_GUIDES,
				route: '/support-guides',
				action: () => navigate( '/support-guides' ),
			},
		];

		const listeners = menuItems.map( ( { id, destination, route, action: onSelect } ) => {
			const element = document.getElementById( id );

			const handleClick = () => {
				// Re-clicking the item for the current route closes the chat; a
				// different route switches view (and opens/expands) without closing.
				const isClosing = isChatVisibleRef.current && currentRouteRef.current === route;
				recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
					section: sectionName || 'wp-admin',
					destination,
					action: isClosing ? 'close' : 'open',
				} );
				if ( isClosing ) {
					closeChatRef.current();
					return;
				}
				onSelect();
				maybeOpenChatRef.current();
			};

			element?.addEventListener( 'click', handleClick );
			return { element, handleClick };
		} );

		return () => {
			listeners.forEach(
				( { element, handleClick } ) => element?.removeEventListener( 'click', handleClick )
			);
		};
	}, [ navigate, sectionName ] );

	return hasAiChatEntry;
}
