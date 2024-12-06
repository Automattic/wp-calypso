/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
const queryClient = new QueryClient();
import './help-center.scss';

function AdminHelpCenterContent() {
	const { setShowHelpCenter } = useDataStoreDispatch( 'automattic/help-center' );
	const { show, unreadCount } = useSelect( ( select ) => ( {
		show: select( 'automattic/help-center' ).isHelpCenterShown(),
		unreadCount: select( 'automattic/help-center' ).getUnreadCount(),
	} ) );
	const button = document.getElementById( 'wp-admin-bar-help-center' );
	const masterbarNotificationsButton = document.getElementById( 'wp-admin-bar-notes' );

	const closeHelpCenterWhenNotificationsPanelIsOpened = useCallback( () => {
		const helpCenterContainerIsVisible = document.querySelector( '.help-center__container' );
		if (
			masterbarNotificationsButton?.classList?.contains( 'wpnt-show' ) &&
			helpCenterContainerIsVisible
		) {
			setShowHelpCenter( false );
		}
	}, [ masterbarNotificationsButton.classList, setShowHelpCenter ] );

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
		if ( show ) {
			button.classList.add( 'active' );
		} else {
			button.classList.remove( 'active' );
		}
	}, [ show, button ] );

	useEffect( () => {
		if ( unreadCount > 0 ) {
			button.classList.add( 'has-unread' );
		} else {
			button.classList.remove( 'has-unread' );
		}
	}, [ unreadCount, button ] );

	const closeCallback = useCallback( () => setShowHelpCenter( false ), [ setShowHelpCenter ] );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: 'wp-admin',
		} );

		setShowHelpCenter( ! show );
	};

	button.onclick = handleToggleHelpCenter;

	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenter
				locale={ helpCenterData.locale }
				sectionName="wp-admin"
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
			/>
		</QueryClientProvider>
	);
}

const target = document.getElementById( 'help-center-masterbar' );
if ( target ) {
	createRoot( target ).render( <AdminHelpCenterContent /> );
}
