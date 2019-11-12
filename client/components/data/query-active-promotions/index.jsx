/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingActivePromotions } from 'state/active-promotions/selectors';
import { requestActivePromotions } from 'state/active-promotions/actions';

export default function QueryActivePromotions() {
	const requestingActivePromotions = useRef( useSelector( isRequestingActivePromotions ) );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( ! requestingActivePromotions.current ) {
			dispatch( requestActivePromotions() );
		}
	}, [ dispatch ] );

	return null;
}
