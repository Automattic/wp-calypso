/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';

export default function QueryProductsList() {
	const isFetching = useRef( useSelector( isProductsListFetching ) );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( ! isFetching.current ) {
			requestProductsList()( dispatch );
		}
	}, [ dispatch ] );

	return null;
}
