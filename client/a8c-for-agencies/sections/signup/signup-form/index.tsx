import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { loadScript } from '@automattic/load-script';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import AgencyDetailsForm from 'calypso/a8c-for-agencies/sections/signup/agency-details-form';
import useCreateAgencyMutation from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-create-agency-mutation';
import AutomatticLogo from 'calypso/components/automattic-logo';
import CardHeading from 'calypso/components/card-heading';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import {
	getSignupDataFromLocalStorage,
	saveSignupDataToLocalStorage,
} from '../lib/signup-data-to-local-storage';
import { useHandleWPCOMRedirect } from './hooks/use-handle-wpcom-redirect';
import type { AgencyDetailsPayload } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/types';
import type { APIError } from 'calypso/state/a8c-for-agencies/types';

import './style.scss';

export default function SignupForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const notificationId = 'a4a-agency-signup-form';
	const signupData = getSignupDataFromLocalStorage() ?? undefined;

	const queryParams = new URLSearchParams( window.location.search );
	const referer = queryParams.get( 'ref' );
	const userLoggedIn = useSelector( isUserLoggedIn );
	const isA4ALoggedOutSignup = isEnabled( 'a4a-logged-out-signup' );
	const shouldRedirectToWPCOM = ! userLoggedIn && isA4ALoggedOutSignup;
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
					services_offered: ( payload.servicesOffered || [] ).join( ',' ),
					products_offered: ( payload.productsOffered || [] ).join( ',' ),
					city: payload.city,
					line1: payload.line1,
					line2: payload.line2,
					country: payload.country,
					postal_code: payload.postalCode,
					state: payload.state,
					referer: payload.referer,
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
		<Card className="agency-signup-form">
			<AutomatticLogo size={ 18 } className="agency-signup-form__logo" />

			<CardHeading className="agency-signup-form__heading">
				{ translate( 'Sign up for Automattic for Agencies' ) }
			</CardHeading>

			<h2 className="agency-signup-form__subheading">
				{ translate( 'Tell us about yourself and your business.' ) }
			</h2>

			<AgencyDetailsForm
				includeTermsOfService
				isLoading={ createAgency.isPending }
				onSubmit={ onSubmit }
				submitLabel={ translate( 'Continue' ) }
				referer={ referer }
				initialValues={ signupData }
			/>
		</Card>
	);
}
