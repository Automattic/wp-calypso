/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useHistory } from 'react-router-dom';
/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';

export default function useLastLocation(): { goLastLocation: () => void } {
	const history = useHistory();

	const lastLocation = useSelect( ( select ) => select( ONBOARD_STORE ).getLastLocation(), [] );

	const goLastLocation = ( fallbackLocation = '/' ) => {
		history.push( lastLocation || fallbackLocation );
	};

	return {
		goLastLocation,
	};
}
