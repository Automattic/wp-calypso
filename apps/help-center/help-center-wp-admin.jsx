/* global helpCenterData */
import './config';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
import { recordHostTracksEvent } from './tracks';

import './help-center.scss';

const queryClient = new QueryClient();

function AdminHelpCenterContent() {
	const { setShowHelpCenter, setShowSupportDoc } = useDataStoreDispatch( 'automattic/help-center' );
	const { isShown, unreadCount } = useSelect(
		( select ) => ( {
			isShown: select( 'automattic/help-center' ).isHelpCenterShown(),
			unreadCount: select( 'automattic/help-center' ).getUnreadCount(),
		} ),
		[]
	);

	// Check for agents-manager-masterbar first, then fall back to help-center
	const button =
		document.getElementById( 'wp-admin-bar-agents-manager' ) ||
		document.getElementById( 'wp-admin-bar-help-center' );

	const masterbarNotificationsButton = document.getElementById( 'wp-admin-bar-notes' );
	const supportLinks = document.querySelectorAll( '[data-target="wpcom-help-center"]' );

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
		recordHostTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown ?? false,
			section: helpCenterData.sectionName || 'wp-admin',
		} );
	}, [ isShown ] );

	const handleToggleHelpCenter = () => {
		trackIconInteraction();
		recordHostTracksEvent( `calypso_inlinehelp_${ isShown ? 'close' : 'show' }`, {
			location: 'help-center',
			section: helpCenterData.sectionName || 'wp-admin',
		} );

		setShowHelpCenter( ! isShown );
	};

	button.onclick = handleToggleHelpCenter;

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

	const customProps = {};

	if ( helpCenterData?.newInteractionsBotSlug ) {
		customProps.newInteractionsBotSlug = helpCenterData.newInteractionsBotSlug;
	}

	if ( helpCenterData?.newLoggedOutInteractionsBotSlug ) {
		customProps.newLoggedOutInteractionsBotSlug = helpCenterData.newLoggedOutInteractionsBotSlug;
	}

	return (
		<HelpCenter
			locale={ helpCenterData.locale }
			sectionName={ helpCenterData.sectionName || 'wp-admin' }
			currentUser={ helpCenterData.currentUser }
			site={ helpCenterData.site }
			hasPurchases={ false }
			onboardingUrl="https://wordpress.com/start"
			handleClose={ closeCallback }
			product={ helpCenterData.isCommerceGarden ? 'commerce-garden' : undefined }
			{ ...customProps }
		/>
	);
}

function mountHelpCenter() {
	const target =
		document.getElementById( 'agents-manager-masterbar' ) ||
		document.getElementById( 'help-center-masterbar' );

	if ( target ) {
		createRoot( target ).render(
			<QueryClientProvider client={ queryClient }>
				<AdminHelpCenterContent />
			</QueryClientProvider>
		);
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountHelpCenter );
} else {
	mountHelpCenter();
}
