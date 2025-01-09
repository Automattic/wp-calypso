import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import A4ALogo, { LOGO_COLOR_SECONDARY_ALT } from 'calypso/a8c-for-agencies/components/a4a-logo';
import {
	A4A_OVERVIEW_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSignupDataFromLocalStorage } from '../../lib/signup-data-to-local-storage';
import useAgencyCreation from './hooks/use-agency-creation';
import './style.scss';

export const MUTATION_DEBOUNCE_MS = 60000; // 60 seconds
const POLL_INTERVAL_MS = 5000; // 5 seconds

export default function AgencySignupFinish() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userLoggedIn = useSelector( isUserLoggedIn );
	const signupData = getSignupDataFromLocalStorage();
	const agency = useSelector( getActiveAgency );
	const { submitAgencyData } = useAgencyCreation();

	// Redirect if agency exists
	useEffect( () => {
		if ( agency ) {
			page.redirect( A4A_OVERVIEW_LINK );
		}
	}, [ agency ] );

	// Initial submission
	useEffect( () => {
		if ( ! userLoggedIn || ! signupData ) {
			page.redirect( A4A_SIGNUP_LINK );
			return;
		}

		const lastMutationTimestamp = localStorage.getItem( 'createAgencylastMutationTimestamp' );
		if ( ! lastMutationTimestamp ) {
			submitAgencyData( signupData );
		}
	}, [ userLoggedIn, signupData, submitAgencyData ] );

	// Poll for agency data and retry mutation if needed
	useInterval(
		() => {
			if ( ! agency ) {
				dispatch( fetchAgencies() );

				// Check if we should retry the mutation
				const lastMutationTimestamp = localStorage.getItem( 'createAgencylastMutationTimestamp' );
				if ( lastMutationTimestamp && signupData ) {
					const timeSinceLastMutation = Date.now() - parseInt( lastMutationTimestamp, 10 );
					if ( timeSinceLastMutation >= MUTATION_DEBOUNCE_MS ) {
						submitAgencyData( signupData );
					}
				}
			}
		},
		! agency ? POLL_INTERVAL_MS : null
	);

	return (
		<div className="agency-signup-finish__wrapper">
			<A4ALogo
				className="agency-signup-finish__logo"
				colors={ { secondary: LOGO_COLOR_SECONDARY_ALT } }
				size={ 48 }
			/>
			<h1 className="agency-signup-finish__text">
				{ translate( 'Please hold, great things are coming.' ) }
			</h1>
		</div>
	);
}
