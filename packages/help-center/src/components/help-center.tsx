/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	HelpCenterRequiredContextProvider,
	useHelpCenterContext,
	type HelpCenterRequiredInformation,
} from '../contexts/HelpCenterContext';
import { useChatStatus, useZendeskMessaging, useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { HelpCenterSelect } from '@automattic/data-stores';
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
	const isHelpCenterShown = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.isHelpCenterShown();
	}, [] );
	const { currentUser } = useHelpCenterContext();

	useEffect( () => {
		if ( currentUser ) {
			initializeAnalytics( currentUser, null );
		}
	}, [ currentUser ] );

	useStillNeedHelpURL();

	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { isMessagingScriptLoaded } = useZendeskMessaging(
		'zendesk_support_chat_key',
		( isHelpCenterShown && isEligibleForChat ) || hasActiveChats,
		isEligibleForChat && hasActiveChats
	);

	useMessagingBindings( hasActiveChats, isMessagingScriptLoaded );

	// Store the last click event to be used for the opening position
	const [ lastClickEvent, setLastClickEvent ] = useState< MouseEvent >();
	const handleLastClickEvent = ( event: MouseEvent ) => {
		setLastClickEvent( event );
	};

	useEffect( () => {
		document.addEventListener( 'mousedown', handleLastClickEvent );

		return () => {
			document.removeEventListener( 'mousedown', handleLastClickEvent );
		};
	}, [] );

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
			lastClickEvent={ lastClickEvent }
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
