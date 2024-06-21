/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	HelpCenterRequiredContextProvider,
	useHelpCenterContext,
	type HelpCenterRequiredInformation,
} from '../contexts/HelpCenterContext';
import { useChatStatus, useZendeskMessaging, useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE, USER_STORE, SITE_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { SiteSelect, UserSelect, HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

function useMessagingBindings( hasActiveChats: boolean, isMessagingScriptLoaded: boolean ) {
	const { setShowMessagingLauncher, setShowMessagingWidget } = useDispatch( HELP_CENTER_STORE );
	const { showMessagingLauncher, showMessagingWidget } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			showMessagingLauncher: helpCenterSelect.isMessagingLauncherShown(),
			showMessagingWidget: helpCenterSelect.isMessagingWidgetShown(),
		};
	}, [] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger:on', 'open', function () {
			setShowMessagingWidget( true );
		} );
		window.zE( 'messenger:on', 'close', function () {
			setShowMessagingWidget( false );
		} );
		window.zE( 'messenger:on', 'unreadMessages', function ( count ) {
			if ( Number( count ) > 0 ) {
				setShowMessagingLauncher( true );
			}
		} );
	}, [ isMessagingScriptLoaded, setShowMessagingLauncher, setShowMessagingWidget ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}
		// `showMessagingLauncher` starts off as undefined. This check means don't touch the widget if we're in default state.
		if ( typeof showMessagingLauncher === 'boolean' ) {
			window.zE( 'messenger', showMessagingLauncher ? 'show' : 'hide' );
		}
	}, [ showMessagingLauncher, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger', showMessagingWidget ? 'open' : 'close' );
	}, [ showMessagingWidget, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( hasActiveChats ) {
			setShowMessagingLauncher( true );
		}
	}, [ setShowMessagingLauncher, hasActiveChats ] );
}

const HelpCenter: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute = window.location.pathname + window.location.search,
} ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { isHelpCenterShown, storedSite } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			storedSite: helpCenterSelect.getSite(),
			isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
		};
	}, [] );
	const { setSite } = useDispatch( HELP_CENTER_STORE );
	const { selectedSiteId, primarySiteId, currentUserId } = useHelpCenterContext();

	useEffect( () => {
		if ( currentUserId ) {
			initializeAnalytics( { ID: currentUserId }, null );
		}
	}, [ currentUserId ] );

	useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] );

	/**
	 * This site is provided by the backed in Editing Toolkit.
	 * It's difficult to get the site information on the client side in Atomic sites. So we moved this challenge to the backend,
	 * and forwarded the data using `localize_script` to the client side.
	 */
	const backendProvidedSite = window?.helpCenterData?.currentSite;

	const site = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( selectedSiteId || primarySiteId ),
		[ selectedSiteId || primarySiteId ]
	);

	const usedSite = backendProvidedSite || site;

	useEffect( () => {
		setSite( usedSite );
	}, [ usedSite, setSite, storedSite ] );

	useStillNeedHelpURL();

	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { isMessagingScriptLoaded } = useZendeskMessaging(
		'zendesk_support_chat_key',
		( isHelpCenterShown && isEligibleForChat ) || hasActiveChats,
		isEligibleForChat && hasActiveChats
	);

	useMessagingBindings( hasActiveChats, isMessagingScriptLoaded );

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		portalParent.setAttribute( 'aria-modal', 'true' );
		portalParent.setAttribute( 'aria-labelledby', 'header-text' );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
			handleClose();
		};
	}, [ portalParent, handleClose ] );

	return createPortal(
		<HelpCenterContainer
			handleClose={ handleClose }
			hidden={ hidden }
			currentRoute={ currentRoute }
		/>,
		portalParent
	);
};

export default function ContextualizedHelpCenter(
	props: Container & HelpCenterRequiredInformation
) {
	return (
		<HelpCenterRequiredContextProvider value={ props }>
			<HelpCenter { ...props } />
		</HelpCenterRequiredContextProvider>
	);
}
