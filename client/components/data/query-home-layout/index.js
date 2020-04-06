/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestHomeLayout } from 'state/home/actions';

export default function QueryHomeLayout( { siteId, isNowLaunched } ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestHomeLayout( siteId, isNowLaunched ) );
	}, [ dispatch, siteId, isNowLaunched ] );

	return null;
}
