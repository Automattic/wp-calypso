import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import './style.scss';

// Admin bar element selectors
const ADMIN_BAR_BUTTON_ID = 'wp-admin-bar-agents-manager';
const ADMIN_BAR_CHAT_ITEM_ID = 'wp-admin-bar-agents-manager-chat-support';
const ADMIN_BAR_HISTORY_ITEM_ID = 'wp-admin-bar-agents-manager-chat-history';
const ADMIN_BAR_GUIDES_ITEM_ID = 'wp-admin-bar-agents-manager-support-guides';

// CSS class names
const ACTIVE_CLASS = 'active';
const OPEN_CLICK_CLASS = 'open-click';

// Tracking event destinations
const DESTINATION_CHAT = 'agents-manager-chat';
const DESTINATION_HISTORY = 'agents-manager-history';
const DESTINATION_GUIDES = 'agents-manager-support-guides';

interface UseAdminBarIntegrationOptions {
	isOpen: boolean;
	sectionName: string;
	setIsOpen: ( isOpen: boolean ) => void;
	navigate: ( route: string, options?: { state?: object } ) => void;
}

/**
 * Custom hook to handle WordPress admin bar integration for agents-manager
 *
 * Manages:
 * - Active state styling on the main button
 * - Menu panel toggle visibility
 * - Click outside to close menu
 * - Menu item click handlers with tracking
 */
export default function useAdminBarIntegration( {
	isOpen,
	sectionName,
	setIsOpen,
	navigate,
}: UseAdminBarIntegrationOptions ) {
	// Update admin bar button active state based on isOpen
	useEffect( () => {
		const button = document.getElementById( ADMIN_BAR_BUTTON_ID );
		if ( button ) {
			if ( isOpen ) {
				button.classList.add( ACTIVE_CLASS );
			} else {
				button.classList.remove( ACTIVE_CLASS );
			}
		}
	}, [ isOpen ] );

	// Monitor clicks on wp-admin bar button to toggle menu visibility
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

	// Monitor clicks on wp-admin bar menu items to switch routes and open agents manager
	useEffect( () => {
		const chatItem = document.getElementById( ADMIN_BAR_CHAT_ITEM_ID );
		const historyItem = document.getElementById( ADMIN_BAR_HISTORY_ITEM_ID );
		const guidesItem = document.getElementById( ADMIN_BAR_GUIDES_ITEM_ID );

		const createMenuItemHandler = ( destination: string, route: string, routeState?: object ) => {
			return () => {
				recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
					section: sectionName || 'wp-admin',
					destination,
				} );
				navigate( route, { state: routeState } );
				setIsOpen( true );
			};
		};

		const handleChatClick = createMenuItemHandler( DESTINATION_CHAT, '/chat', {
			isNewChat: true,
		} );
		const handleHistoryClick = createMenuItemHandler( DESTINATION_HISTORY, '/history' );
		const handleGuidesClick = createMenuItemHandler( DESTINATION_GUIDES, '/support-guides' );

		chatItem?.addEventListener( 'click', handleChatClick );
		historyItem?.addEventListener( 'click', handleHistoryClick );
		guidesItem?.addEventListener( 'click', handleGuidesClick );

		return () => {
			chatItem?.removeEventListener( 'click', handleChatClick );
			historyItem?.removeEventListener( 'click', handleHistoryClick );
			guidesItem?.removeEventListener( 'click', handleGuidesClick );
		};
	}, [ navigate, setIsOpen, sectionName ] );
}
