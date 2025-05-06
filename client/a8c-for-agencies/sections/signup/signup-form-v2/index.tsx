import { loadScript } from '@automattic/load-script';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { APIError } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import useCreateAgencyMutation from '../agency-details-form/hooks/use-create-agency-mutation';
import { AgencyDetailsPayload } from '../agency-details-form/types';
import {
	getSignupDataFromLocalStorage,
	saveSignupDataToLocalStorage,
} from '../lib/signup-data-to-local-storage';
import { useHandleWPCOMRedirect } from '../signup-form/hooks/use-handle-wpcom-redirect';
import SignupWrapper from './components/signup-wrapper';
import SimpleForm from './components/simple-form';

const SignupFormV2 = () => {
	const dispatch = useDispatch();

	const notificationId = 'a4a-agency-signup-form';
	const cachedSignupData = getSignupDataFromLocalStorage() ?? undefined;

	const queryParams = new URLSearchParams( window.location.search );
	const referer = queryParams.get( 'ref' );
	const userLoggedIn = useSelector( isUserLoggedIn );
	const shouldRedirectToWPCOM = ! userLoggedIn;
	const handleWPCOMRedirect = useHandleWPCOMRedirect();

	const createAgency = useCreateAgencyMutation( {
		onSuccess: () => {
			dispatch( fetchAgencies() );
		},
		onError: ( error: APIError ) => {
			dispatch( errorNotice( error?.message, { id: notificationId } ) );
		},
	} );

	const onSubmit = useCallback(
		async ( payload: AgencyDetailsPayload ) => {
			dispatch( removeNotice( notificationId ) );
			if ( shouldRedirectToWPCOM ) {
				saveSignupDataToLocalStorage( payload );
				handleWPCOMRedirect( payload );
				return;
			}

			createAgency.mutate( payload );

			dispatch(
				recordTracksEvent( 'calypso_a4a_create_agency_submit', {
					first_name: payload.firstName,
					last_name: payload.lastName,
					name: payload.agencyName,
					business_url: payload.agencyUrl,
					managed_sites: payload.managedSites,
					user_type: payload.userType,
					services_offered: ( payload.servicesOffered || [] ).join( ',' ),
					products_offered: ( payload.productsOffered || [] ).join( ',' ),
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
					referer: payload.referer,
					phone_number: payload.phone?.phoneNumberFull ?? '',
				} )
			);
		},
		[ dispatch, shouldRedirectToWPCOM, createAgency, handleWPCOMRedirect ]
	);

	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
	}, [] );

	return (
		<SignupWrapper>
			<SimpleForm onSubmit={ onSubmit } referer={ referer } initialValues={ cachedSignupData } />
		</SignupWrapper>
	);
};

export default SignupFormV2;
