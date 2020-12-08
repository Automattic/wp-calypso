/**
 * External dependencies
 */
/**
 * Internal dependencies
 */
import { requestViewers } from 'calypso/state/viewers/actions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const QueryViewers = ( { siteId, page, number } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestViewers( siteId, { page, number } ) );
	}, [ dispatch, siteId, page, number ] );

	return null;
};

export default QueryViewers;
