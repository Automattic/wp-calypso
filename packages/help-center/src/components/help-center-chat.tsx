/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useEffect } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureConfig, useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useChatStatus, useShouldUseWapuu } from '../hooks';
import { useHelpCenterTracksEvent } from '../hooks/use-help-center-tracks-event';
import type { JSX } from 'react';
import './help-center-chat.scss';

export function HelpCenterChat( {
	isLoadingStatus,
	isUserEligibleForPaidSupport,
}: {
	isLoadingStatus: boolean;
	isUserEligibleForPaidSupport: boolean;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	// Before issuing a redirect, make sure the status is loaded.
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport && ! isLoadingStatus;
	const {
		currentUser,
		site,
		newInteractionsBotSlug,
		newLoggedOutInteractionsBotSlug,
		newInteractionsBotVersion,
	} = useHelpCenterContext();
	const featureConfig = useFeatureConfig();
	const { data: canConnectToZendesk, isLoading } = useCanConnectToZendeskMessaging(
		!! currentUser?.ID
	);
	const { search } = useLocation();
	const { data } = useSupportStatus( ! featureConfig.chat.skipSupportStatus );
	const params = new URLSearchParams( search );
	const userFieldMessage = params.get( 'userFieldMessage' );
	const siteUrl = params.get( 'siteUrl' );
	const siteId = params.get( 'siteId' );
	const requestedSiteId = Number( siteId ) || Number( site?.ID );
	const selectedSiteId =
		Number.isInteger( requestedSiteId ) && requestedSiteId > 0 ? requestedSiteId : undefined;
	const recordTracksEvent = useHelpCenterTracksEvent( { explicitSiteId: selectedSiteId } );
	const externalChatProvider = params.get( 'externalChatProvider' );
	const externalChatId = params.get( 'externalChatId' );

	const userFieldFlowName = featureConfig.chat.flowName || data?.eligibility?.user_field_flow_name;

	const { forceEmailSupport, isChatRestricted } = useChatStatus();

	useEffect( () => {
		if ( preventOdieAccess ) {
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			navigate( '/' );
		}
	}, [ navigate, preventOdieAccess, recordTracksEvent ] );

	return (
		<OdieAssistantProvider
			newInteractionsBotSlug={ newInteractionsBotSlug }
			newLoggedOutInteractionsBotSlug={ newLoggedOutInteractionsBotSlug }
			newInteractionsBotVersion={ newInteractionsBotVersion }
			currentUser={ currentUser }
			canConnectToZendesk={ canConnectToZendesk }
			isLoadingCanConnectToZendesk={ isLoading }
			selectedSiteId={ selectedSiteId }
			selectedSiteURL={ siteUrl || ( site?.URL as string ) }
			userFieldMessage={ userFieldMessage }
			userFieldFlowName={ userFieldFlowName ?? params.get( 'userFieldFlowName' ) }
			externalChatProvider={ externalChatProvider }
			externalChatId={ externalChatId }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
			forceEmailSupport={ Boolean( forceEmailSupport ) }
			isChatRestricted={ Boolean( isChatRestricted ) }
		>
			<div className="help-center__container-chat">
				<OdieAssistant />
			</div>
		</OdieAssistantProvider>
	);
}
