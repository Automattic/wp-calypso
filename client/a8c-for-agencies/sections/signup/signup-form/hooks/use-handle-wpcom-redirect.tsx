import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { AgencyDetailsPayload } from '../../agency-details-form/types';

export function useHandleWPCOMRedirect() {
	const dispatch = useDispatch();
	const locale = useLocale();
	const notificationId = 'a4a-agency-signup-form-wpcom-redirect';

	const handleWPCOMRedirect = useCallback(
		( payload: AgencyDetailsPayload ) => {
			try {
				const returnUri = new URL( '/signup/oauth/token', window.location.origin );
				const authUrl = new URL( config( 'wpcom_authorize_endpoint' ) );
				dispatch(
					recordTracksEvent( 'calypso_a4a_create_agency_redirect_to_wpcom_login', {
						first_name: payload.firstName,
						last_name: payload.lastName,
						name: payload.agencyName,
						business_url: payload.agencyUrl,
						agency_size: payload.agencySize,
						managed_sites: payload.managedSites,
						services_offered: ( payload.servicesOffered || [] ).join( ',' ),
						products_offered: ( payload.productsOffered || [] ).join( ',' ),
						products_to_offer: ( payload.productsToOffer || [] ).join( ',' ),
						city: payload.city,
						line1: payload.line1,
						line2: payload.line2,
						country: payload.country,
						postal_code: payload.postalCode,
						state: payload.state,
						referer: payload.referer,
					} )
				);
				authUrl.search = new URLSearchParams( {
					response_type: 'token',
					client_id: config( 'oauth_client_id' ),
					redirect_uri: returnUri.toString(),
					scope: 'global',
					locale,
				} ).toString();
				window.location.replace( authUrl.toString() );
			} catch ( error ) {
				dispatch( errorNotice( JSON.stringify( error ), { id: notificationId } ) );
			}
		},
		[ dispatch, locale ]
	);

	return handleWPCOMRedirect;
}
