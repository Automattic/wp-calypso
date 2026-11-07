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
import { useHasOpenZendeskChat } from '../hooks/use-has-open-zendesk-chat';
import { useHelpCenterTracksEvent } from '../hooks/use-help-center-tracks-event';
import { WOO_HUMAN_SUPPORT_ROUTING } from './woo-human-support-routing-step';
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
	const { hasOpenZendeskChat, isLoading: isLoadingOpenZendeskChat } = useHasOpenZendeskChat();
	// Before issuing a redirect, make sure the status is loaded. An open human chat is always
	// reachable, so wait for that check too.
	const preventOdieAccess =
		! shouldUseWapuu &&
		! isUserEligibleForPaidSupport &&
		! hasOpenZendeskChat &&
		! isLoadingStatus &&
		! isLoadingOpenZendeskChat;
	const {
		currentUser,
		site,
		newInteractionsBotSlug,
		newLoggedOutInteractionsBotSlug,
		newInteractionsBotVersion,
		launcherContext,
	} = useHelpCenterContext();
	const featureConfig = useFeatureConfig();
	const { search } = useLocation();
	const { data } = useSupportStatus( ! featureConfig.chat.skipSupportStatus );
	const params = new URLSearchParams( search );
	const userFieldMessage = params.get( 'userFieldMessage' );
	const siteUrl = params.get( 'siteUrl' );
	const siteId = params.get( 'siteId' );
	const requestedSiteId = Number( siteId ) || Number( site?.ID );
	const selectedSiteId =
		Number.isInteger( requestedSiteId ) && requestedSiteId > 0 ? requestedSiteId : undefined;
	const { data: canConnectToZendesk, isLoading } = useCanConnectToZendeskMessaging(
		!! currentUser?.ID,
		selectedSiteId ?? site?.ID
	);
	const recordTracksEvent = useHelpCenterTracksEvent( { explicitSiteId: selectedSiteId } );
	const externalChatProvider = params.get( 'externalChatProvider' );
	const externalChatId = params.get( 'externalChatId' );

	const userFieldFlowName = data?.eligibility?.user_field_flow_name;

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
			// Without paid support, whether the chat loads from Zendesk depends on the open-chat check,
			// so don't settle on an AI-only chat before it's in.
			isLoadingCanConnectToZendesk={
				isLoading || ( ! isUserEligibleForPaidSupport && isLoadingOpenZendeskChat )
			}
			selectedSiteId={ selectedSiteId }
			selectedSiteURL={ siteUrl || ( site?.URL as string ) }
			userFieldMessage={ userFieldMessage }
			userFieldFlowName={ userFieldFlowName ?? params.get( 'userFieldFlowName' ) }
			zendeskConversationTags={ featureConfig.chat.zendeskConversationTags }
			zendeskIntegrationKey={ featureConfig.chat.zendeskIntegrationKey }
			humanSupportRouting={
				featureConfig.chat.humanSupportRouting === 'woo' ? WOO_HUMAN_SUPPORT_ROUTING : null
			}
			externalChatProvider={ externalChatProvider }
			externalChatId={ externalChatId }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
			hasOpenZendeskChat={ hasOpenZendeskChat }
			forceEmailSupport={ Boolean( forceEmailSupport ) }
			isChatRestricted={ Boolean( isChatRestricted ) }
			launcherContext={ launcherContext }
		>
			<div className="help-center__container-chat">
				<OdieAssistant />
			</div>
		</OdieAssistantProvider>
	);
}
