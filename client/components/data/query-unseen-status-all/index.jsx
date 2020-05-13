/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUnseenStatusAll } from 'state/reader/seen-posts/actions';

export default function QueryUnseenStatusAll() {
	const dispatch = useDispatch();
	React.useEffect( () => {
		dispatch( requestUnseenStatusAll() );
	}, [ dispatch ] );

	return null;
}
