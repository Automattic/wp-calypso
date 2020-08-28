/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';

export default function useDisplayErrors( errorMessages ) {
	useEffect( () => {
		errorMessages.map( ( errorMessage ) => {
			notices.error( errorMessage );
		} );
	}, [ errorMessages ] );
}
