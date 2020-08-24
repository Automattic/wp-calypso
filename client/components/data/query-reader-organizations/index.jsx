/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestOrganizations } from 'state/reader/organizations/actions';

export default function QueryReaderOrganizations() {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestOrganizations() );
	}, [ dispatch ] );

	return null;
}
