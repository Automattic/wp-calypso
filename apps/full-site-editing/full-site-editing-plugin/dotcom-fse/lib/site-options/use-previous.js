/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Custom hook to provide the previous value of state or props in a functional component
 *
 * see https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 *
 * @param  {any}  value state or prop value for which previous value is required
 * @returns {any}  previous value of requested state or prop value
 */
export function usePrevious( value ) {
	const ref = useRef();

	useEffect( () => {
		ref.current = value;
	}, [ value ] );

	return ref.current;
}
