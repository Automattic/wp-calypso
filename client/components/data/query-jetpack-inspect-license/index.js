/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { inspectLicense } from 'calypso/state/jetpack-licensing/actions';

export default function QueryJetpackInspectLicense( { licenseKey } ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( inspectLicense( licenseKey ) );
	}, [ dispatch, licenseKey ] );

	return null;
}
