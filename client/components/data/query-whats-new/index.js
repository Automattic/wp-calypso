/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWhatsNewList } from 'calypso/state/whats-new/actions';

export default function QueryWhatsNewList( siteId ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestWhatsNewList( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
