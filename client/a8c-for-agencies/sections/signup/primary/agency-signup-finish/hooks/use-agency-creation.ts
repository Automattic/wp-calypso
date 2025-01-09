import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { APIError } from '@automattic/data-stores';
import { useCallback } from 'react';
import { A4A_SIGNUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { MUTATION_DEBOUNCE_MS } from '..';
import useCreateAgencyMutation from '../../../agency-details-form/hooks/use-create-agency-mutation';
import { AgencyDetailsPayload } from '../../../agency-details-form/types';
import { clearSignupDataFromLocalStorage } from '../../../lib/signup-data-to-local-storage';

const NOTIFICATION_ID = 'a4a-agency-signup-form';

function useAgencyCreation() {
	const dispatch = useDispatch();

	const createAgency = useCreateAgencyMutation( {
		onSuccess: () => {
			dispatch( fetchAgencies() );
			clearSignupDataFromLocalStorage();
		},
		onError: ( error: APIError ) => {
			page( A4A_SIGNUP_LINK );
			dispatch( errorNotice( error?.message, { id: NOTIFICATION_ID } ) );
		},
	} );

	const submitAgencyData = useCallback(
		( signupData: AgencyDetailsPayload ) => {
			const lastMutationTimestamp = localStorage.getItem( 'createAgencylastMutationTimestamp' );
			const currentTime = Date.now();

			if ( lastMutationTimestamp ) {
				const timeSinceLastMutation = currentTime - parseInt( lastMutationTimestamp, 10 );
				if ( timeSinceLastMutation < MUTATION_DEBOUNCE_MS ) {
					return false;
				}
			}

			createAgency.mutate( signupData );
			localStorage.setItem( 'createAgencylastMutationTimestamp', currentTime.toString() );

			dispatch(
				recordTracksEvent( 'calypso_a4a_create_agency_finish_submit', {
					first_name: signupData.firstName,
					last_name: signupData.lastName,
					name: signupData.agencyName,
					business_url: signupData.agencyUrl,
					managed_sites: signupData.managedSites,
					services_offered: ( signupData.servicesOffered || [] ).join( ',' ),
					products_offered: ( signupData.productsOffered || [] ).join( ',' ),
					city: signupData.city,
					line1: signupData.line1,
					line2: signupData.line2,
					country: signupData.country,
					postal_code: signupData.postalCode,
					state: signupData.state,
					referer: signupData.referer,
				} )
			);

			return true;
		},
		[ createAgency, dispatch ]
	);

	return { submitAgencyData };
}

export default useAgencyCreation;
