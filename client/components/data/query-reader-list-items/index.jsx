/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestReaderListItems } from 'state/reader/lists/actions';

export default function QueryReaderListItems( { listOwner, listSlug } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestReaderListItems( listOwner, listSlug ) );
	}, [ dispatch, listOwner, listSlug ] );

	return null;
}
