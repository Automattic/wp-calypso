import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';

export function useIntent() {
	return useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
}
