/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useEffect } from '@wordpress/element';
import { useNavigate, useParams } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { ExtraContactOptions } from './help-center-extra-contact-option';

/**
 * Internal Dependencies
 */
import './help-center-chat.scss';

export function HelpCenterChat( {
	isUserEligibleForPaidSupport,
}: {
	isUserEligibleForPaidSupport: boolean;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport;
	const { currentUser, site, shouldUseHelpCenterExperience, canConnectToZendesk } =
		useHelpCenterContext();
	const { id: conversationId = null } = useParams();

	useEffect( () => {
		if ( preventOdieAccess ) {
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			navigate( '/' );
		}
	}, [] );

	const odieVersion = null; // Use the default version specified on the back-end

	return (
		<OdieAssistantProvider
			shouldUseHelpCenterExperience={ shouldUseHelpCenterExperience }
			currentUser={ currentUser }
			canConnectToZendesk={ canConnectToZendesk }
			selectedSiteId={ site?.ID as number }
			selectedSiteURL={ site?.URL as string }
			selectedConversationId={ conversationId }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
			extraContactOptions={
				<ExtraContactOptions isUserEligible={ isUserEligibleForPaidSupport } />
			}
			version={ odieVersion }
		>
			<div className="help-center__container-chat">
				<OdieAssistant />
			</div>
		</OdieAssistantProvider>
	);
}
