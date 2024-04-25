import page from '@automattic/calypso-router';
import { Spinner } from '@automattic/components';
import { loadScript } from '@automattic/load-script';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	A4A_OVERVIEW_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSignupDataFromLocalStorage } from '../../lib/signup-data-to-local-storage';
import { verifySignupData } from './utils';
import './style.scss';

export default function AgencySignupFinish() {
	const userLoggedIn = useSelector( isUserLoggedIn );
	const signupData = getSignupDataFromLocalStorage();
	const agency = useSelector( getActiveAgency );
	const translate = useTranslate();

	useEffect( () => {
		if ( ! userLoggedIn || ! verifySignupData( signupData ) ) {
			// Redirect to the signup page if user is not logged in or data from local storage is malformed.
			page.redirect( A4A_SIGNUP_LINK );
		}
	}, [ userLoggedIn, signupData ] );

	useEffect( () => {
		if ( agency ) {
			// Redirect to the sites page if the user already has an agency record.
			page.redirect( A4A_OVERVIEW_LINK );
		}
	}, [ agency ] );

	useEffect( () => {
		// We need to include HubSpot tracking code on the signup form.
		loadScript( '//js.hs-scripts.com/45522507.js' );
	}, [] );

	return (
		<div className="agency-signup-finish__wrapper">
			<h1 className="agency-signup-finish__text">
				{ translate( 'Agency is being created. Please wait a few moments.' ) }
			</h1>
			<Spinner size={ 64 } />
		</div>
	);
}
