/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSupportHistory } from 'state/help/actions';

export default function QuerySupportHistory( { email } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestSupportHistory( email ) );
	}, [ dispatch, email ] );

	return null;
}
