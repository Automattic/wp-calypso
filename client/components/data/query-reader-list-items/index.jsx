/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestReaderListItems } from 'state/reader/lists/actions';

export default function QueryReaderListItems( { listAuthor, listSlug } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( requestReaderListItems( listAuthor, listSlug ) );
	}, [ dispatch, listAuthor, listSlug ] );

	return null;
}
