/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestHomeLayout } from 'state/home/actions';

export default function QueryHomeLayout( { siteId } ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestHomeLayout( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
