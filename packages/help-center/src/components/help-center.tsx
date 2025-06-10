/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
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
import { useActionHooks } from '../hooks';
import { useOpeningCoordinates } from '../hooks/use-opening-coordinates';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import HelpCenterSmooch from './help-center-smooch';
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
	const { currentUser, canConnectToZendesk } = useHelpCenterContext();
	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );
	const hasOpenZendeskConversations =
		! isLoadingOpenInteractions && supportInteractionsOpen
			? supportInteractionsOpen?.length > 0
			: false;

	useEffect( () => {
		if ( currentUser ) {
			initializeAnalytics( currentUser, null );
		}
	}, [ currentUser ] );

	useActionHooks();

	const openingCoordinates = useOpeningCoordinates( ! isHelpCenterShown, isMinimized );

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		portalParent.setAttribute( 'role', 'dialog' );
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
