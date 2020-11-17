/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { inspectLicense } from 'calypso/state/jetpack-licensing/actions';
import { useTranslate } from 'i18n-calypso';

export default function QueryJetpackInspectLicense( { licenseKey } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		if ( licenseKey ) {
			dispatch( inspectLicense( licenseKey ) );
		}
	}, [ dispatch, licenseKey ] );

	return null;
}
