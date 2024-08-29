/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter from '@automattic/help-center';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback, useMemo } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { createRoot } from 'react-dom/client';
import './help-button.scss';

const queryClient = new QueryClient();

function AdminHelpCenterContent() {
	const { isRTL } = useI18n();

	const cssUrl = `https://widgets.wp.com/help-center/help-center-wp-admin${
		isRTL() ? '.rtl' : ''
	}.css`;

	const wpComponentsCssUrl = `https://widgets.wp.com/help-center/wp-components-styles${
		isRTL() ? '.rtl' : ''
	}.css`;

	const cssUrls = useMemo( () => [ cssUrl, wpComponentsCssUrl ], [ cssUrl, wpComponentsCssUrl ] );

	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );
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
				shadowCSSFromUrls={ cssUrls }
			/>
		</QueryClientProvider>
	);
}

const target = document.getElementById( 'help-center-masterbar' );
createRoot( target ).render( <AdminHelpCenterContent /> );
