/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import UnifiedAIAgent from '@automattic/agents-manager';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
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
import { useShouldUseUnifiedAgent } from '../hooks';
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
	// Create portal parent and append to DOM immediately (only once)
	const portalParentRef = useRef< HTMLDivElement >();
	if ( ! portalParentRef.current ) {
		const div = document.createElement( 'div' );
		div.classList.add( 'help-center' );
		div.setAttribute( 'role', 'dialog' );
		div.setAttribute( 'aria-modal', 'true' );
		div.setAttribute( 'aria-labelledby', 'header-text' );
		document.body.appendChild( div );
		portalParentRef.current = div;
	}
	const portalParent = portalParentRef.current;

	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	const isHelpCenterShown = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.isHelpCenterShown();
	}, [] );
	const { currentUser, site, sectionName } = useHelpCenterContext();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk' );
	const hasOpenZendeskConversations =
		! isLoadingOpenInteractions && supportInteractionsOpen
			? supportInteractionsOpen?.length > 0
			: false;

	useEffect( () => {
		if ( currentUser ) {
			initializeAnalytics( currentUser, null );
		}
	}, [ currentUser ] );

	// Cleanup: remove portal parent when component unmounts
	useEffect( () => {
		return () => {
			if ( portalParent && portalParent.parentNode ) {
				document.body.removeChild( portalParent );
			}
		};
	}, [ portalParent ] );

	// Render unified agent if flag is enabled
	if ( shouldUseUnifiedAgent ) {
		return createPortal(
			<UnifiedAIAgent
				containerSelector=".help-center"
				currentUser={ currentUser }
				site={ site }
				sectionName={ sectionName }
				handleClose={ handleClose }
				defaultOpen
			/>,
			portalParent
		);
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
		portalParent
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
