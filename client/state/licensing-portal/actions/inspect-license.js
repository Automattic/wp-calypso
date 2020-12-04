/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_INSPECT_LICENSE_KEY_UPDATE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { getActivePartnerKey, isInspecting } from 'calypso/state/licensing-portal/selectors';
import wpcomUndocumented from 'calypso/lib/wpcom-undocumented';
import wpcomXhrWrapper from 'calypso/lib/wpcom-xhr-wrapper';

// Required for modular state.
import 'calypso/state/licensing-portal/init';

export const setInspectedLicenseKey = ( licenseKey ) => ( dispatch, getState ) => {
	if ( isInspecting( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_LICENSING_INSPECT_LICENSE_KEY_UPDATE, licenseKey } );
};

export const inspectLicense = ( licenseKey ) => ( dispatch, getState ) => {
	if ( isInspecting( getState() ) ) {
		return;
	}

	const partnerKey = getActivePartnerKey( getState() );

	if ( ! partnerKey ) {
		return;
	}

	const authToken = partnerKey.oauth2_token;

	dispatch( {
		type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
		licenseKey,
	} );

	// Create a fresh instance as licensing endpoints use a different token.
	const wpcom = wpcomUndocumented( authToken, wpcomXhrWrapper );

	wpcom
		.undocumented()
		.inspectJetpackLicense( licenseKey )
		.then(
			( response ) =>
				dispatch( {
					type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
					licenseKey,
					license: JSON.stringify( response ),
				} ),
			( error ) => {
				dispatch( {
					type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE,
					licenseKey,
					error: {
						status: error.status,
						code: error.code || '',
						message: error.message,
					},
				} );
			}
		);
};
