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
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const portalParentRef = useRef< HTMLDivElement >();

	const isHelpCenterShown = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.isHelpCenterShown();
	}, [] );
	const {
		currentUser,
		site,
		sectionName,
		toolProvider,
		contextProvider,
		suggestions,
		markdownComponents,
		markdownExtensions,
	} = useHelpCenterContext();
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

	// Create portal container on mount, cleanup on unmount
	useEffect( () => {
		if ( ! shouldUseUnifiedAgent && ! portalParentRef.current ) {
			const div = document.createElement( 'div' );
			div.classList.add( 'help-center' );
			div.setAttribute( 'role', 'dialog' );
			div.setAttribute( 'aria-modal', 'true' );
			div.setAttribute( 'aria-labelledby', 'header-text' );
			document.body.appendChild( div );
			portalParentRef.current = div;
		}

		return () => {
			if ( portalParentRef.current?.parentNode ) {
				document.body.removeChild( portalParentRef.current );
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Render unified agent if flag is enabled
	if ( shouldUseUnifiedAgent ) {
		return (
			<UnifiedAIAgent
				currentUser={ currentUser }
				site={ site }
				sectionName={ sectionName }
				handleClose={ handleClose }
				toolProvider={ toolProvider }
				contextProvider={ contextProvider }
				emptyViewSuggestions={ suggestions }
				markdownComponents={ markdownComponents }
				markdownExtensions={ markdownExtensions }
			/>
		);
	}

	if ( ! portalParentRef.current ) {
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
		portalParentRef.current
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
