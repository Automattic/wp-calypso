/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_INSPECT_LICENSE_KEY_UPDATE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import 'calypso/state/jetpack-licensing/init';
import { isInspecting } from 'calypso/state/jetpack-licensing/selectors';
import wpcomUndocumented from 'calypso/lib/wpcom-undocumented';
import wpcomXhrWrapper from 'calypso/lib/wpcom-xhr-wrapper';

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

	dispatch( {
		type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
		licenseKey,
	} );

	// Create a fresh instance as licensing endpoints use a different token.
	wpcom = wpcomUndocumented( 'TBD token goes here', wpcomXhrWrapper );

	wpcom
		.undocumented()
		.inspectJetpackLicense( licenseKey )
		.then(
			( response ) =>
				dispatch( {
					type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
					licenseKey,
					license: response,
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
