/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useEffect } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { ExtraContactOptions } from './help-center-extra-contact-option';

/**
 * Internal Dependencies
 */
import './help-center-chat.scss';

export function HelpCenterChat( {
	isUserEligibleForPaidSupport,
	userFieldFlowName,
}: {
	isUserEligibleForPaidSupport: boolean;
	userFieldFlowName?: string;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport;
	const { currentUser, site, canConnectToZendesk, isLoadingCanConnectToZendesk } =
		useHelpCenterContext();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const userFieldMessage = params.get( 'userFieldMessage' );
	const siteUrl = params.get( 'siteUrl' );
	const siteId = params.get( 'siteId' );

	useEffect( () => {
		if ( preventOdieAccess ) {
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			navigate( '/' );
		}
	}, [] );

	return (
		<OdieAssistantProvider
			currentUser={ currentUser }
			canConnectToZendesk={ canConnectToZendesk }
			isLoadingCanConnectToZendesk={ isLoadingCanConnectToZendesk }
			selectedSiteId={ Number( siteId ) || ( site?.ID as number ) }
			selectedSiteURL={ siteUrl || ( site?.URL as string ) }
			userFieldMessage={ userFieldMessage }
			userFieldFlowName={ userFieldFlowName ?? params.get( 'userFieldFlowName' ) }
			isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
			extraContactOptions={
				<ExtraContactOptions isUserEligible={ isUserEligibleForPaidSupport } />
			}
		>
			<div className="help-center__container-chat">
				<OdieAssistant />
			</div>
		</OdieAssistantProvider>
	);
}
