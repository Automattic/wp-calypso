import page from '@automattic/calypso-router';
import { APIError } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import A4ALogo, { LOGO_COLOR_SECONDARY_ALT } from 'calypso/a8c-for-agencies/components/a4a-logo';
import {
	A4A_OVERVIEW_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import useCreateAgencyMutation from '../../agency-details-form/hooks/use-create-agency-mutation';
import { getSignupDataFromRequestParameters } from '../../lib/signup-data-from-reqest-parameters';
import {
	clearSignupDataFromLocalStorage,
	getSignupDataFromLocalStorage,
	saveSignupDataToLocalStorage,
} from '../../lib/signup-data-to-local-storage';
import { useHandleWPCOMRedirect } from '../../signup-form/hooks/use-handle-wpcom-redirect';

import './style.scss';

export default function AgencySignupFinish() {
	const notificationId = 'a4a-agency-signup-form';
	const userLoggedIn = useSelector( isUserLoggedIn );
	const signupData = getSignupDataFromRequestParameters() ?? getSignupDataFromLocalStorage();
	const agency = useSelector( getActiveAgency );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const handleWPCOMRedirect = useHandleWPCOMRedirect();

	const createAgency = useCreateAgencyMutation( {
		onSuccess: () => {
			dispatch( fetchAgencies() );
			clearSignupDataFromLocalStorage();
		},
		onError: ( error: APIError ) => {
			page( A4A_SIGNUP_LINK );
			dispatch( errorNotice( error?.message, { id: notificationId } ) );
		},
	} );

	useEffect( () => {
		if ( agency ) {
			// Redirect to the sites page if the user already has an agency record.
			page.redirect( A4A_OVERVIEW_LINK );
		}
	}, [ agency ] );

	useEffect( () => {
		function createAgencyHandler() {
			// If the signup data is not present, redirect to the signup page.
			if ( ! signupData ) {
				page.redirect( A4A_SIGNUP_LINK );
				return;
			}

			// If the user is not logged in, save the signup data to local storage and redirect to the WPCOM login page.
			if ( ! userLoggedIn ) {
				saveSignupDataToLocalStorage( signupData );
				handleWPCOMRedirect( signupData );
				return;
			}

			createAgency.mutate( signupData );
			dispatch(
				recordTracksEvent( 'calypso_a4a_create_agency_finish_submit', {
					first_name: signupData.firstName,
					last_name: signupData.lastName,
					name: signupData.agencyName,
					business_url: signupData.agencyUrl,
					agency_size: signupData.agencySize,
					managed_sites: signupData.managedSites,
					services_offered: ( signupData.servicesOffered || [] ).join( ',' ),
					products_offered: ( signupData.productsOffered || [] ).join( ',' ),
					products_to_offer: ( signupData.productsToOffer || [] ).join( ',' ),
					city: signupData.city,
					line1: signupData.line1,
					line2: signupData.line2,
					country: signupData.country,
					postal_code: signupData.postalCode,
					state: signupData.state,
					referer: signupData.referer,
				} )
			);
		}
		createAgencyHandler();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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
