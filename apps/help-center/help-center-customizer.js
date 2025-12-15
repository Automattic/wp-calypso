/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createRoot } from 'react-dom/client';

import './help-center.scss';

const queryClient = new QueryClient();

function CustomizerHelpCenterContent() {
	const { setShowHelpCenter } = useDataStoreDispatch( 'automattic/help-center' );
	const { isShown, unreadCount } = useSelect(
		( select ) => ( {
			isShown: select( 'automattic/help-center' ).isHelpCenterShown(),
			unreadCount: select( 'automattic/help-center' ).getUnreadCount(),
		} ),
		[]
	);

	const button = document.querySelector( '.customize-help-toggle' );

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
			is_help_center_visible: isShown ?? false,
			section: helpCenterData.sectionName || 'wp-customizer',
			is_menu_panel_enabled: false,
		} );
	}, [ isShown ] );

	const handleToggleHelpCenter = useCallback( () => {
		trackIconInteraction();
		recordTracksEvent( `calypso_inlinehelp_${ isShown ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: helpCenterData.sectionName || 'wp-customizer',
		} );

		setShowHelpCenter( ! isShown );
	}, [ isShown, setShowHelpCenter, trackIconInteraction ] );

	useEffect( () => {
		if ( ! button ) {
			return;
		}

		const handler = ( event ) => {
			event.stopImmediatePropagation();
			event.preventDefault();
			handleToggleHelpCenter();
		};

		button.addEventListener( 'click', handler, { capture: true } );

		return () => {
			button.removeEventListener( 'click', handler, { capture: true } );
		};
	}, [ button, handleToggleHelpCenter ] );

	return (
		<HelpCenter
			locale={ helpCenterData.locale }
			sectionName={ helpCenterData.sectionName || 'wp-customizer' }
			currentUser={ helpCenterData.currentUser }
			site={ helpCenterData.site }
			hasPurchases={ false }
			onboardingUrl="https://wordpress.com/start"
			handleClose={ closeCallback }
			isCommerceGarden={ helpCenterData.isCommerceGarden }
		/>
	);
}

function initCustomizerHelpCenter() {
	const target = document.getElementById( 'help-center-customizer' );

	if ( target ) {
		createRoot( target ).render(
			<QueryClientProvider client={ queryClient }>
				<CustomizerHelpCenterContent />
			</QueryClientProvider>
		);
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initCustomizerHelpCenter );
} else {
	initCustomizerHelpCenter();
}
