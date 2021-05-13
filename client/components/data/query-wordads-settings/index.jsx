/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestWordadsSettings } from 'calypso/state/wordads/settings/actions';

export default function QueryWordadsSettings( { siteId } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestWordadsSettings( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
