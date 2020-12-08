/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestReaderListItems } from 'calypso/state/reader/lists/actions';

export default function QueryReaderListItems( { owner, slug } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestReaderListItems( owner, slug ) );
	}, [ dispatch, owner, slug ] );

	return null;
}
