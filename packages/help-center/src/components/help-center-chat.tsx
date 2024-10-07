/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant } from '@automattic/odie-client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { ExtraContactOptions } from './help-center-extra-contact-option';

/**
 * Internal Dependencies
 */
import './help-center-chat.scss';

export function HelpCenterChat( {
	isLoadingEnvironment,
	isUserEligibleForPaidSupport,
	searchTerm,
}: {
	isLoadingEnvironment: boolean;
	isUserEligibleForPaidSupport: boolean;
	searchTerm: string;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport;
	const { currentUser, site } = useHelpCenterContext();

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
			isLoadingEnvironment={ isLoadingEnvironment }
			currentUser={ currentUser }
			initialUserMessage={ searchTerm }
			selectedSiteId={ site?.ID as number }
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
