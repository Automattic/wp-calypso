/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { inspectLicense } from 'calypso/state/jetpack-licensing/actions';

export default function QueryJetpackInspectLicense( { licenseKey, authToken } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		if ( licenseKey ) {
			dispatch( inspectLicense( licenseKey, authToken ) );
		}
	}, [ dispatch, licenseKey ] );

	return null;
}
