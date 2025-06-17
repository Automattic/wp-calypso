/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { OdieAssistant } from '@automattic/odie-client';
import { useEffect } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useShouldUseWapuu } from '../hooks';
import './help-center-chat.scss';

export function HelpCenterChat( {
	isUserEligibleForPaidSupport,
}: {
	isUserEligibleForPaidSupport: boolean;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligibleForPaidSupport;

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
		<div className="help-center__container-chat">
			<OdieAssistant />
		</div>
	);
}
