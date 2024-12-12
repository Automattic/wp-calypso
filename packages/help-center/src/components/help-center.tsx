/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useSelect } from '@wordpress/data';
import { createPortal, useEffect } from '@wordpress/element';
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
import { isUseHelpCenterExperienceEnabled } from './utils';
import type { HelpCenterSelect } from '@automattic/data-stores';

import '../styles.scss';

const portalParent = document.createElement( 'div' );
portalParent.className = 'help-center';
portalParent.setAttribute( 'aria-modal', 'true' );
portalParent.setAttribute( 'aria-labelledby', 'header-text' );

const HelpCenter: React.FC< Container > = ( {
	handleClose,
	hidden,
	currentRoute = window.location.pathname + window.location.search,
	shouldUseHelpCenterExperience,
} ) => {
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

	useEffect( () => {
		if ( isHelpCenterShown ) {
			document.body.appendChild( portalParent );
		} else {
			portalParent.remove();
		}
	}, [ isHelpCenterShown ] );

	useActionHooks();

	const openingCoordinates = useOpeningCoordinates( isHelpCenterShown, isMinimized );

	return createPortal(
		<>
			<HelpCenterContainer
				handleClose={ handleClose }
				hidden={ hidden }
				currentRoute={ currentRoute }
				openingCoordinates={ openingCoordinates }
			/>
			{ shouldUseHelpCenterExperience && canConnectToZendesk && (
				<HelpCenterSmooch enableAuth={ isHelpCenterShown || hasOpenZendeskConversations } />
			) }
		</>,
		portalParent
	);
};

export default function ContextualizedHelpCenter(
	props: Container & HelpCenterRequiredInformation
) {
	const shouldUseHelpCenterExperience =
		config.isEnabled( 'help-center-experience' ) ||
		isUseHelpCenterExperienceEnabled( props.currentUser?.ID );

	return (
		<HelpCenterRequiredContextProvider value={ { ...props, shouldUseHelpCenterExperience } }>
			<HelpCenter { ...props } shouldUseHelpCenterExperience={ shouldUseHelpCenterExperience } />
		</HelpCenterRequiredContextProvider>
	);
}
