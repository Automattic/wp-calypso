import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
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
	isOpen: boolean;
	sectionName: string;
	maybeOpenChat: () => void;
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
	isOpen,
	sectionName,
	maybeOpenChat,
}: UseAdminBarIntegrationOptions ): boolean {
	const navigate = useNavigate();
	const { getActiveSessionId } = useAgentsManagerContext();

	// Reopen the chat on its conversation view, resuming the active session.
	// Non-reader chats only resume via router state, so pass the session id.
	const resumeChat = () => navigate( '/chat', { state: { sessionId: getActiveSessionId() } } );

	// Refs keep the latest callbacks without re-attaching DOM listeners each render.
	const maybeOpenChatRef = useRef( maybeOpenChat );
	maybeOpenChatRef.current = maybeOpenChat;
	const resumeChatRef = useRef( resumeChat );
	resumeChatRef.current = resumeChat;

	// Whether the AI chat entry button is present (captured once on mount).
	const [ hasAiChatEntry ] = useState( hasAiChatEntryButton );

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
			if (
				button &&
				! button.contains( event.target as Node ) &&
				button.classList.contains( OPEN_CLICK_CLASS )
			) {
				button.classList.remove( OPEN_CLICK_CLASS );
			}
		};

		document.addEventListener( 'click', handleClickOutside );
		return () => {
			document.removeEventListener( 'click', handleClickOutside );
		};
	}, [] );

	// The standalone AI button reopens the chat, resuming the active conversation.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		const handleClick = () => {
			recordTracksEvent( 'calypso_admin_bar_agents_manager_ai_chat_clicked', {
				section: sectionName || 'wp-admin',
			} );
			resumeChatRef.current();
			maybeOpenChatRef.current();
		};

		aiChatButton.addEventListener( 'click', handleClick );
		return () => aiChatButton.removeEventListener( 'click', handleClick );
	}, [ sectionName ] );

	// Wire the Help menu items to open the chat (resume, or navigate to their route).
	useEffect( () => {
		const chatItem = document.getElementById( ADMIN_BAR_CHAT_ITEM_ID );
		const historyItem = document.getElementById( ADMIN_BAR_HISTORY_ITEM_ID );
		const guidesItem = document.getElementById( ADMIN_BAR_GUIDES_ITEM_ID );

		const createMenuItemHandler = ( destination: string, openChat: () => void ) => {
			return () => {
				recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
					section: sectionName || 'wp-admin',
					destination,
				} );
				openChat();
				maybeOpenChatRef.current();
			};
		};

		// Chat Support resumes the active conversation, matching the AI button.
		const handleChatClick = createMenuItemHandler( DESTINATION_CHAT, () =>
			resumeChatRef.current()
		);
		const handleHistoryClick = createMenuItemHandler( DESTINATION_HISTORY, () =>
			navigate( '/history' )
		);
		const handleGuidesClick = createMenuItemHandler( DESTINATION_GUIDES, () =>
			navigate( '/support-guides' )
		);

		chatItem?.addEventListener( 'click', handleChatClick );
		historyItem?.addEventListener( 'click', handleHistoryClick );
		guidesItem?.addEventListener( 'click', handleGuidesClick );

		return () => {
			chatItem?.removeEventListener( 'click', handleChatClick );
			historyItem?.removeEventListener( 'click', handleHistoryClick );
			guidesItem?.removeEventListener( 'click', handleGuidesClick );
		};
	}, [ navigate, sectionName ] );

	return hasAiChatEntry;
}
