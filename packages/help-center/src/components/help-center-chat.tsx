/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useEffect } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useChatStatus, useShouldUseWapuu, useLastSupportInteraction } from '../hooks';
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
	const { forceEmailSupport } = useChatStatus();
	useLastSupportInteraction( { isUserEligibleForPaidSupport, userFieldFlowName } );

	useEffect( () => {
		if ( preventOdieAccess ) {
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			navigate( '/' );
		}
	}, [ navigate, preventOdieAccess ] );

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
