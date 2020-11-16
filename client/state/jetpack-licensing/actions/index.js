/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_INSPECT_LICENSE_UPDATE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE,
	JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';
import { isInspecting } from 'calypso/state/jetpack-licensing/selectors';

export const setInspectedLicenseKey = ( licenseKey ) => ( dispatch, getState ) => {
	if ( isInspecting( getState() ) ) {
		console.log( 'ALREADY INSPECTING' );
		return;
	}

	console.log( 'DISPATCH', { type: JETPACK_LICENSING_INSPECT_LICENSE_UPDATE, licenseKey } );
	dispatch( { type: JETPACK_LICENSING_INSPECT_LICENSE_UPDATE, licenseKey } );
};

export const inspectLicense = ( licenseKey ) => ( dispatch, getState ) => {
	if ( isInspecting( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST, licenseKey } );

	wpcom
		.undocumented()
		.inspectLicense( licenseKey )
		.then(
			( response ) =>
				dispatch( {
					type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_SUCCESS,
					licenseKey,
					response,
				} ),
			( e ) =>
				dispatch( { type: JETPACK_LICENSING_INSPECT_LICENSE_REQUEST_FAILURE, licenseKey, e } )
		);
};
