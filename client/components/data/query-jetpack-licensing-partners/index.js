/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartners } from 'calypso/state/licensing-portal/actions';

export default function QueryJetpackLicensingPartners() {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( fetchPartners() );
	}, [] );

	return null;
}
