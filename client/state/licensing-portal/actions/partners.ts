/**
 * External dependencies
 */
import { Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_FAILURE,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { isFetchingPartners } from 'calypso/state/licensing-portal/selectors';
import wpcom from 'calypso/lib/wp';
import { APIError, Partner } from 'calypso/state/licensing-portal';

// Required for modular state.
import 'calypso/state/licensing-portal/init';

export function setActivePartnerKey( partnerKeyId: number ) {
	return ( dispatch: Dispatch, getState: () => any ) => {
		if ( isFetchingPartners( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_LICENSING_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );
	};
}

export function fetchPartners() {
	return ( dispatch: Dispatch, getState: () => any ) => {
		if ( isFetchingPartners( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST } );

		wpcom
			.undocumented()
			.getJetpackLicensingPartners()
			.then(
				( partners: Partner[] ) =>
					dispatch( {
						type: JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
						partners,
					} ),
				( error: APIError ) => {
					dispatch( {
						type: JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_FAILURE,
						error: {
							status: error.status,
							code: error.code || '',
							message: error.message,
						},
					} );
				}
			);
	};
}
