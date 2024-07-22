/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useZendeskMessagingBindings, useLoadZendeskMessaging } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	HelpCenterRequiredContextProvider,
	useHelpCenterContext,
	type HelpCenterRequiredInformation,
} from '../contexts/HelpCenterContext';
import { useChatStatus, useStillNeedHelpURL, useActionHooks } from '../hooks';
import { useOpeningCoordinates } from '../hooks/use-opening-coordinates';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

const HelpCenter: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute = window.location.pathname + window.location.search,
} ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
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

	useStillNeedHelpURL();
	useActionHooks();

	const { hasActiveChats, isEligibleForChat } = useChatStatus();
	const { isMessagingScriptLoaded } = useLoadZendeskMessaging(
		'zendesk_support_chat_key',
		( isHelpCenterShown && isEligibleForChat ) || hasActiveChats,
		isEligibleForChat && hasActiveChats
	);

	useZendeskMessagingBindings( HELP_CENTER_STORE, hasActiveChats, isMessagingScriptLoaded );

	const openingCoordinates = useOpeningCoordinates( isHelpCenterShown, isMinimized );

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
