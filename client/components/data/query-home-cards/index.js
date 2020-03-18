/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestHomeCards } from 'state/home/actions';

export default function QueryHomeCards( { siteId } ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestHomeCards( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
