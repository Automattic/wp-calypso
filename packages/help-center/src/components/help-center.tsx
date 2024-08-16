/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useZendeskMessagingBindings, useLoadZendeskMessaging } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import { createPortal, useEffect, useRef, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	HelpCenterRequiredContextProvider,
	useHelpCenterContext,
	type HelpCenterRequiredInformation,
} from '../contexts/HelpCenterContext';
import { useChatStatus, useActionHooks } from '../hooks';
import { useOpeningCoordinates } from '../hooks/use-opening-coordinates';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

function createRoot( stylesURL: string ) {
	const shadowRootOwner = document.createElement( 'div' );
	document.body.appendChild( shadowRootOwner );

	const root = shadowRootOwner.attachShadow( { mode: 'open' } );

	const style = document.createElement( 'style' );
	style.innerHTML = `@import '${ stylesURL }'`;
	root.appendChild( style );

	return root;
}

const HelpCenter: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute = window.location.pathname + window.location.search,
	shadowCSSFromURL,
} ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const [ shadowRoot, setShadowRoot ] = useState< ShadowRoot >();
	const { isHelpCenterShown, isMinimized } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
			isMinimized: helpCenterSelect.getIsMinimized(),
		};
	}, [] );

	const { currentUser } = useHelpCenterContext();

	useEffect( () => {
		if ( currentUser ) {
			initializeAnalytics( currentUser, null );
		}
	}, [ currentUser ] );

	useActionHooks();

	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { isMessagingScriptLoaded } = useLoadZendeskMessaging(
		'zendesk_support_chat_key',
		( isHelpCenterShown && isEligibleForChat ) || hasActiveChats,
		isEligibleForChat || hasActiveChats
	);

	useZendeskMessagingBindings( HELP_CENTER_STORE, hasActiveChats, isMessagingScriptLoaded );

	const openingCoordinates = useOpeningCoordinates( isHelpCenterShown, isMinimized );

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		portalParent.setAttribute( 'aria-modal', 'true' );
		portalParent.setAttribute( 'aria-labelledby', 'header-text' );

		if ( shadowCSSFromURL ) {
			const root = createRoot( shadowCSSFromURL );
			root.appendChild( portalParent );
			setShadowRoot( root );
		} else {
			document.body.appendChild( portalParent );
		}

		return () => {
			document.body.removeChild( portalParent );
			handleClose();
		};
	}, [ portalParent, shadowCSSFromURL, handleClose ] );

	useEffect( () => {
		/**
		 * Annoyingly, @wordpress/components use Emotion (CSS in JS).
		 * Which stylizes elements in runtime, losing ShadowDOM support.
		 * This copies the styles added by emotion to our shadowRoot.
		 */
		if ( shadowRoot && isHelpCenterShown ) {
			try {
				const emotionStyleSheets =
					document.querySelectorAll< HTMLStyleElement >( "[ data-emotion='css' ]" );
				emotionStyleSheets.forEach( ( el ) => {
					const css = Array.from( el.sheet?.cssRules ?? [] )
						.map( ( el ) => el.cssText )
						.join( '\n' );
					const sheet = new CSSStyleSheet();
					sheet.replaceSync( css );
					shadowRoot.adoptedStyleSheets.push( sheet );
				} );
			} catch ( e ) {}
		}
	}, [ shadowRoot, isHelpCenterShown ] );

	return createPortal(
		<HelpCenterContainer
			handleClose={ handleClose }
			hidden={ hidden }
			currentRoute={ currentRoute }
			openingCoordinates={ openingCoordinates }
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
