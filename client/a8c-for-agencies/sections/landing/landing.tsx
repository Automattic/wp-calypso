import page from '@automattic/calypso-router';
import { addQueryArgs, getQueryArg, getQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import {
	A4A_OVERVIEW_LINK,
	A4A_SIGNUP_LINK,
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	hasFetchedAgency,
	isAgencyClientUser,
} from 'calypso/state/a8c-for-agencies/agency/selectors';

/**
 * Redirect with Current Query
 * Adds all of the current location's query parameters to the provided URL before redirecting.
 */
const redirectWithCurrentQuery = ( url: string ) => {
	const args = getQueryArgs( window.location.href );
	return page.redirect( addQueryArgs( url, args ) );
};

export default function Landing() {
	const translate = useTranslate();
	const title = translate( 'Automattic for Agencies' );

	const hasFetched = useSelector( hasFetchedAgency );
	const agency = useSelector( getActiveAgency );
	const isClientUser = useSelector( isAgencyClientUser );

	useEffect( () => {
		if ( ! hasFetched ) {
			return;
		}

		if ( isClientUser ) {
			return page.redirect( A4A_CLIENT_SUBSCRIPTIONS_LINK );
		}

		if ( agency ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;

			if ( returnQuery ) {
				page.redirect( returnQuery );
				return;
			}

			return redirectWithCurrentQuery( A4A_OVERVIEW_LINK );
		}

		redirectWithCurrentQuery( A4A_SIGNUP_LINK );
	}, [ agency, hasFetched, isClientUser ] );

	return <PagePlaceholder title={ title } />;
}
