/**
 * External dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { useVerticalQueryParam } from '../path';

export function useShowVerticalInput() {
	const hasVerticalQueryParam = useVerticalQueryParam();

	const { showVerticalInput } = useDispatch( STORE_KEY );

	if ( hasVerticalQueryParam ) {
		showVerticalInput( true );
	}

	const { shouldShowVerticalInput } = useSelect( ( select ) => select( STORE_KEY ).getState() );

	return hasVerticalQueryParam || shouldShowVerticalInput;
}
