/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useShouldUseUnifiedAgent } from '@automattic/agents-manager';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	HelpCenterRequiredContextProvider,
	useHelpCenterContext,
	type HelpCenterRequiredInformation,
} from '../contexts/HelpCenterContext';
import { useGetSupportInteractions } from '../hooks/use-get-support-interactions';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import HelpCenterSmooch from './help-center-smooch';
import type { HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

const HelpCenter: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute = window.location.pathname + window.location.search + window.location.hash,
} ) => {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const [ container, setContainer ] = useState< HTMLDivElement >();

	const isHelpCenterShown = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.isHelpCenterShown();
	}, [] );
	const { currentUser } = useHelpCenterContext();
	const { setCurrentUser } = useDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging( !! currentUser?.ID );
	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk' );
	const hasOpenZendeskConversations =
		! isLoadingOpenInteractions && supportInteractionsOpen
			? supportInteractionsOpen?.length > 0
			: false;

	useEffect( () => {
		if ( currentUser ) {
			initializeAnalytics( currentUser, null );
			setCurrentUser( currentUser );
		}
	}, [ currentUser, setCurrentUser ] );

	// Create portal container on mount, cleanup on unmount
	useEffect( () => {
		let div: HTMLDivElement | undefined;
		if ( ! shouldUseUnifiedAgent ) {
			div = document.createElement( 'div' );
			div.classList.add( 'help-center' );
			div.setAttribute( 'role', 'dialog' );
			div.setAttribute( 'aria-modal', 'true' );
			div.setAttribute( 'aria-labelledby', 'header-text' );
			document.body.appendChild( div );
			setContainer( div );
		}

		return () => {
			if ( div ) {
				document.body.removeChild( div );
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// If unified agent flag is enabled, things will be handled by agents-manager app
	if ( ! container || shouldUseUnifiedAgent ) {
		return null;
	}

	// Default: render traditional help center
	return createPortal(
		<>
			<HelpCenterContainer
				handleClose={ handleClose }
				hidden={ hidden }
				currentRoute={ currentRoute }
			/>
			{ canConnectToZendesk && (
				<HelpCenterSmooch enableAuth={ isHelpCenterShown || hasOpenZendeskConversations } />
			) }
		</>,
		container
	);
};

export default function ContextualizedHelpCenter( {
	hidden,
	currentRoute,
	handleClose,
	...props
}: Container &
	Partial< HelpCenterRequiredInformation > &
	Pick< HelpCenterRequiredInformation, 'currentUser' | 'sectionName' > ) {
	return (
		<HelpCenterRequiredContextProvider value={ props }>
			<HelpCenter hidden={ hidden } currentRoute={ currentRoute } handleClose={ handleClose } />
		</HelpCenterRequiredContextProvider>
	);
}
