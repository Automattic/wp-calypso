import { getValidBlogId, recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { useAiChatEntryState } from '../use-ai-chat-entry-state';
import useHasAiChatEntryButton, {
	ADMIN_BAR_AI_CHAT_BUTTON_ID,
} from '../use-has-ai-chat-entry-button';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import '../../styles/ai-chat-label.scss';
import './style.scss';

// Admin bar element selectors
const ADMIN_BAR_BUTTON_ID = 'wp-admin-bar-agents-manager';
const ADMIN_BAR_CHAT_ITEM_ID = 'wp-admin-bar-agents-manager-chat-support';
const ADMIN_BAR_HISTORY_ITEM_ID = 'wp-admin-bar-agents-manager-chat-history';
const ADMIN_BAR_GUIDES_ITEM_ID = 'wp-admin-bar-agents-manager-support-guides';

// CSS class names
const OPEN_CLICK_CLASS = 'open-click';
const CHAT_VISIBLE_CLASS = 'is-chat-visible';
const LABEL_REVEALED_CLASS = 'is-revealed';

// Tracking event destinations
const DESTINATION_CHAT = 'agents-manager-chat';
const DESTINATION_HISTORY = 'agents-manager-history';
const DESTINATION_GUIDES = 'agents-manager-support-guides';

interface UseAdminBarIntegrationOptions {
	openChat: () => void;
	closeChat: () => void;
}

/**
 * Custom hook to handle WordPress admin bar integration for agents-manager
 *
 * Manages:
 * - Help menu panel toggle visibility
 * - Click outside to close the menu
 * - Menu item and AI chat button click handlers with tracking
 * - The AI chat button's "Agent" label, shown while the chat is hidden
 *
 * Returns whether the AI chat entry button is present on the page.
 */
export default function useAdminBarIntegration( {
	openChat,
	closeChat,
}: UseAdminBarIntegrationOptions ): boolean {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { currentUser, resumeChat, sectionName, site } = useAgentsManagerContext();
	const currentSiteId = getValidBlogId( site?.ID );
	const siteId = currentSiteId ?? getValidBlogId( currentUser?.primary_blog );
	const siteContextSource = currentSiteId ? 'agents_manager_context' : 'primary_site';
	const isOpen = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getIsOpen(),
		[]
	);

	// Refs keep the latest callbacks without re-attaching DOM listeners each render.
	const openChatRef = useRef( openChat );
	openChatRef.current = openChat;
	const closeChatRef = useRef( closeChat );
	closeChatRef.current = closeChat;
	const resumeChatRef = useRef( resumeChat );
	resumeChatRef.current = resumeChat;

	const hasAiChatEntry = useHasAiChatEntryButton();
	const { isChatVisible } = useAiChatEntryState();

	// Read inside the one-time DOM click handlers below to decide whether a
	// click opens or closes the chat.
	const isChatVisibleRef = useRef( false );
	isChatVisibleRef.current = isChatVisible;

	// PHP renders the label, pre-hidden when the persisted state says the chat
	// will restore visible; from here on the store decides (this hook mounts
	// only after that state has loaded). Only a label brought back by closing
	// the chat animates, never one painted with the page.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		const wasChatVisible = aiChatButton.classList.contains( CHAT_VISIBLE_CLASS );
		aiChatButton.classList.toggle( CHAT_VISIBLE_CLASS, isChatVisible );
		if ( wasChatVisible && ! isChatVisible ) {
			aiChatButton
				.querySelector( '.agents-manager-ai-chat-label' )
				?.classList.add( LABEL_REVEALED_CLASS );
		}
	}, [ isChatVisible ] );

	// The chat's current route, read inside those same handlers so a Help menu item
	// only closes the chat when it targets the route already showing.
	const currentRouteRef = useRef( pathname );
	currentRouteRef.current = pathname;

	// Toggle the Help button's dropdown menu when it is clicked.
	useEffect( () => {
		const button = document.getElementById( ADMIN_BAR_BUTTON_ID );

		const handleMenuPanelClick = () => {
			// Track icon interaction
			recordTracksEvent(
				'wpcom_help_center_icon_interaction',
				withSiteContext(
					{
						is_help_center_visible: isOpen,
						section: sectionName || 'wp-admin',
						is_menu_panel_enabled: false,
						is_assignment_loaded: true,
					},
					siteContextSource,
					siteId
				)
			);

			// Track the toggle action
			recordTracksEvent(
				`calypso_inlinehelp_${ isOpen ? 'close' : 'show' }`,
				withSiteContext(
					{
						location: 'help-center',
						section: sectionName || 'wp-admin',
					},
					siteContextSource,
					siteId
				)
			);

			// Toggle submenu visibility by toggling the open-click class
			button?.classList.toggle( OPEN_CLICK_CLASS );
		};

		if ( button ) {
			button.onclick = handleMenuPanelClick;
		}
	}, [ isOpen, sectionName, siteContextSource, siteId ] );

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
	// otherwise resume the tab's conversation and open it.
	useEffect( () => {
		const aiChatButton = document.getElementById( ADMIN_BAR_AI_CHAT_BUTTON_ID );
		if ( ! aiChatButton ) {
			return;
		}

		const handleClick = () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
				surface: 'admin_bar',
				section: sectionName || 'wp-admin',
				action: isChatVisibleRef.current ? 'close' : 'open',
			} );
			if ( isChatVisibleRef.current ) {
				closeChatRef.current();
				return;
			}
			resumeChatRef.current();
			openChatRef.current();
		};

		aiChatButton.addEventListener( 'click', handleClick );
		return () => aiChatButton.removeEventListener( 'click', handleClick );
	}, [ sectionName ] );

	// Wire each Help menu item's click: track it, then open or close the chat.
	useEffect( () => {
		const menuItems = [
			// Chat Support resumes the tab's conversation, matching the AI button.
			{
				id: ADMIN_BAR_CHAT_ITEM_ID,
				destination: DESTINATION_CHAT,
				route: '/chat',
				action: () => resumeChatRef.current(),
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
				openChatRef.current();
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
