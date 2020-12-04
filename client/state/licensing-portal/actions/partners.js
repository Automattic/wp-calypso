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

// Required for modular state.
import 'calypso/state/licensing-portal/init';

export const setActivePartnerKey = ( partnerKeyId ) => ( dispatch, getState ) => {
	if ( isFetchingPartners( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_LICENSING_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );
};

export const fetchPartners = () => ( dispatch, getState ) => {
	if ( isFetchingPartners( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST } );

	wpcom
		.undocumented()
		.getJetpackLicensingPartners()
		.then(
			( response ) =>
				dispatch( {
					type: JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
					partners: response,
				} ),
			( error ) => {
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
