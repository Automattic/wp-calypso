import page from '@automattic/calypso-router';
import { APIError } from '@automattic/data-stores';
import { loadScript } from '@automattic/load-script';
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
import {
	clearSignupDataFromLocalStorage,
	getSignupDataFromLocalStorage,
} from '../../lib/signup-data-to-local-storage';
import './style.scss';

export default function AgencySignupFinish() {
	const notificationId = 'a4a-agency-signup-form';
	const userLoggedIn = useSelector( isUserLoggedIn );
	const signupData = getSignupDataFromLocalStorage();
	const agency = useSelector( getActiveAgency );
	const translate = useTranslate();
	const dispatch = useDispatch();

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
		async function createAgencyHandler() {
			// Added to prevent typescript errors and for additional safety
			if ( ! userLoggedIn || ! signupData ) {
				page.redirect( A4A_SIGNUP_LINK );
				return;
			}
			await loadScript( '//js.hs-scripts.com/45522507.js' );

			createAgency.mutate( signupData );
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
