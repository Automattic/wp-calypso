/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	useSmooch,
	useZendeskMessagingBindings,
	useLoadZendeskMessaging,
} from '@automattic/zendesk-client';
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
import { useChatStatus, useActionHooks } from '../hooks';
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
	const smoochRef = useRef< HTMLDivElement >( null );
	const shouldUseFancyHelpCenter = config.isEnabled( 'help-center-experience' );
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
		isHelpCenterShown && isEligibleForChat,
		isEligibleForChat
	);

	const { initSmooch, destroy } = useSmooch();

	const openingCoordinates = useOpeningCoordinates( isHelpCenterShown, isMinimized );

	// Initialize Smooch which communicates with Zendesk
	useEffect( () => {
		if ( shouldUseFancyHelpCenter && isMessagingScriptLoaded && smoochRef?.current ) {
			initSmooch( smoochRef.current );
		}

		return () => {
			destroy();
		};
	}, [ smoochRef?.current, isMessagingScriptLoaded ] );

	useZendeskMessagingBindings(
		HELP_CENTER_STORE,
		hasActiveChats,
		isMessagingScriptLoaded && ! shouldUseFancyHelpCenter
	);

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
		<>
			<HelpCenterContainer
				handleClose={ handleClose }
				hidden={ hidden }
				currentRoute={ currentRoute }
				openingCoordinates={ openingCoordinates }
			/>
			<div ref={ smoochRef } style={ { display: 'none' } }></div>
		</>,
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
