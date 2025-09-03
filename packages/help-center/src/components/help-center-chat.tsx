/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useCurrentSupportInteraction } from '@automattic/odie-client/src/data/use-current-support-interaction';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data/use-manage-support-interaction';
import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useChatStatus, useShouldUseWapuu } from '../hooks';
import './help-center-chat.scss';

export function HelpCenterChat( {
	isLoadingStatus,
	isUserEligibleForPaidSupport,
	userFieldFlowName,
}: {
	isLoadingStatus: boolean;
	isUserEligibleForPaidSupport: boolean;
	userFieldFlowName?: string;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const { sectionName } = useHelpCenterContext();
	// Before issuing a redirect, make sure the status is loaded.
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport && ! isLoadingStatus;
	const { currentUser, site } = useHelpCenterContext();
	const { data: canConnectToZendesk, isLoading } = useCanConnectToZendeskMessaging();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const userFieldMessage = params.get( 'userFieldMessage' );
	const siteUrl = params.get( 'siteUrl' );
	const siteId = params.get( 'siteId' );
	const interactionId = params.get( 'id' );
	const { forceEmailSupport } = useChatStatus();

	useEffect( () => {
		if ( preventOdieAccess ) {
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			navigate( '/' );
		}
	}, [ navigate, preventOdieAccess ] );

	const queryClient = useQueryClient();
	const { startNewInteraction, isMutating: isStartingNewInteraction } =
		useManageSupportInteraction();
	const currentInteractionQuery = useCurrentSupportInteraction();

	useEffect( () => {
		// If a user lands at /odie without an ID, we need to create a new support interaction and redirect to the new URL.
		if ( ! interactionId && ! isStartingNewInteraction ) {
			const newID = crypto.randomUUID();
			startNewInteraction( {
				event_source: 'help-center',
				event_external_id: newID,
			} ).then( ( interaction ) => {
				navigate( `/odie?id=${ interaction.uuid }`, { replace: true } );
				const isTestMode = isTestModeEnvironment();
				const queryKey = [
					'support-interactions',
					'get-interaction-by-id',
					interaction.uuid,
					isTestMode,
				];
				queryClient.setQueryData( queryKey, interaction );
			} );
		}
	}, [
		interactionId,
		startNewInteraction,
		navigate,
		queryClient,
		currentInteractionQuery,
		isStartingNewInteraction,
	] );

	return (
		<OdieAssistantProvider
			currentUser={ currentUser }
			canConnectToZendesk={ canConnectToZendesk }
			isLoadingCanConnectToZendesk={ isLoading }
			selectedSiteId={ Number( siteId ) || ( site?.ID as number ) }
			selectedSiteURL={ siteUrl || ( site?.URL as string ) }
			userFieldMessage={ userFieldMessage }
			userFieldFlowName={ userFieldFlowName ?? params.get( 'userFieldFlowName' ) }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
			forceEmailSupport={ Boolean( forceEmailSupport ) }
			sectionName={ sectionName }
		>
			<div className="help-center__container-chat">
				<OdieAssistant />
			</div>
		</OdieAssistantProvider>
	);
}
