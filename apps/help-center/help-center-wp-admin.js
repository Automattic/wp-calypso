/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback, useState } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
const queryClient = new QueryClient();
import './help-center.scss';

function AdminHelpCenterContent() {
	const { setShowHelpCenter, setShowSupportDoc, setNavigateToRoute } =
		useDataStoreDispatch( 'automattic/help-center' );
	const { isShown, unreadCount } = useSelect(
		( select ) => ( {
			isShown: select( 'automattic/help-center' ).isHelpCenterShown(),
			unreadCount: select( 'automattic/help-center' ).getUnreadCount(),
		} ),
		[]
	);
	const [ helpCenterPage, setHelpCenterPage ] = useState( null );

	const button = document.getElementById( 'wp-admin-bar-help-center' );
	const chatSupportButton = document.getElementById( 'wp-admin-bar-help-center-chat-support' );
	const chatHistoryButton = document.getElementById( 'wp-admin-bar-help-center-chat-history' );
	const supportGuidesButton = document.getElementById( 'wp-admin-bar-help-center-support-guides' );

	const masterbarNotificationsButton = document.getElementById( 'wp-admin-bar-notes' );
	const supportLinks = document.querySelectorAll( '[data-target="wpcom-help-center"]' );
	const urlParams = new URLSearchParams( window.location.search );
	const hasHelpCenterMenuPanel = urlParams.get( 'flags' ) === 'help-center-menu-panel';

	const closeHelpCenterWhenNotificationsPanelIsOpened = useCallback( () => {
		const helpCenterContainerIsVisible = document.querySelector( '.help-center__container' );
		if (
			masterbarNotificationsButton?.classList?.contains( 'wpnt-show' ) &&
			helpCenterContainerIsVisible
		) {
			setShowHelpCenter( false );
		}
	}, [ masterbarNotificationsButton?.classList, setShowHelpCenter ] );

	useEffect( () => {
		if ( masterbarNotificationsButton ) {
			masterbarNotificationsButton.addEventListener( 'click', () => {
				closeHelpCenterWhenNotificationsPanelIsOpened();
			} );
		}

		return () => {
			if ( masterbarNotificationsButton ) {
				masterbarNotificationsButton.removeEventListener( 'click', () => {
					closeHelpCenterWhenNotificationsPanelIsOpened();
				} );
			}
		};
	}, [] );

	useEffect( () => {
		if ( isShown ) {
			button.classList.add( 'active' );
		} else {
			button.classList.remove( 'active' );
		}
	}, [ isShown, button ] );

	useEffect( () => {
		if ( unreadCount > 0 ) {
			button.classList.add( 'has-unread' );
		} else {
			button.classList.remove( 'has-unread' );
		}
	}, [ unreadCount, button ] );

	const closeCallback = useCallback(
		() => setShowHelpCenter( false, undefined, true ),
		[ setShowHelpCenter ]
	);

	const trackIconInteraction = useCallback( () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown,
			section: helpCenterData.sectionName || 'wp-admin',
			is_menu_panel_enabled: hasHelpCenterMenuPanel,
		} );
	}, [ isShown, hasHelpCenterMenuPanel ] );

	const handleToggleHelpCenter = () => {
		trackIconInteraction();
		recordTracksEvent( `calypso_inlinehelp_${ isShown ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: helpCenterData.sectionName || 'wp-admin',
		} );

		setShowHelpCenter( ! isShown );
	};

	button.onclick = hasHelpCenterMenuPanel ? trackIconInteraction : handleToggleHelpCenter;

	const handleMenuClick = useCallback(
		( destination, isExternal = false ) => {
			recordTracksEvent( `calypso_dashboard_help_center_menu_panel_click`, {
				section: helpCenterData.sectionName || 'wp-admin',
				destination,
			} );

			if ( isExternal ) {
				return window.open( destination, '_blank', 'noopener,noreferrer' );
			}

			if ( isShown ) {
				if ( destination !== helpCenterPage ) {
					setNavigateToRoute( destination );
					setHelpCenterPage( destination );
				} else {
					recordTracksEvent( `calypso_inlinehelp_close`, {
						force_site_id: true,
						location: 'help-center',
						section: helpCenterData.sectionName || 'wp-admin',
					} );
					setShowHelpCenter( false );
					setHelpCenterPage( null );
				}
			} else {
				setNavigateToRoute( destination );
				setHelpCenterPage( destination );
				setShowHelpCenter( true );

				recordTracksEvent( `calypso_inlinehelp_show`, {
					force_site_id: true,
					location: 'help-center',
					section: helpCenterData.sectionName || 'wp-admin',
					destination,
				} );
			}
		},
		[ isShown, setNavigateToRoute, setHelpCenterPage, setShowHelpCenter, helpCenterPage ]
	);
	if ( chatSupportButton ) {
		chatSupportButton.onclick = () => {
			handleMenuClick( '/odie' );
		};
	}

	if ( chatHistoryButton ) {
		chatHistoryButton.onclick = () => {
			handleMenuClick( '/chat-history' );
		};
	}

	if ( supportGuidesButton ) {
		supportGuidesButton.onclick = () => {
			handleMenuClick( '/support-guides' );
		};
	}

	const openSupportLinkInHelpCenter = useCallback(
		( event ) => {
			if ( ! setShowSupportDoc ) {
				return;
			}
			event.preventDefault();
			setShowSupportDoc( event.target.href );
		},
		[ setShowSupportDoc ]
	);

	useEffect( () => {
		supportLinks.forEach( ( link ) => {
			link.addEventListener( 'click', openSupportLinkInHelpCenter );
		} );

		return () => {
			supportLinks.forEach( ( link ) => {
				link.removeEventListener( 'click', openSupportLinkInHelpCenter );
			} );
		};
	}, [] );

	const botProps = helpCenterData.isCommerceGarden
		? { newInteractionsBotSlug: 'ciab-workflow-support_chat' }
		: {};

	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenter
				locale={ helpCenterData.locale }
				sectionName={ helpCenterData.sectionName || 'wp-admin' }
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
				isCommerceGarden={ helpCenterData.isCommerceGarden }
				{ ...botProps }
			/>
		</QueryClientProvider>
	);
}

const target = document.getElementById( 'help-center-masterbar' );
if ( target ) {
	createRoot( target ).render( <AdminHelpCenterContent /> );
}
