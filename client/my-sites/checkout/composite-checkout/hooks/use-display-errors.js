/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';

export default function useDisplayErrors( errors ) {
	useEffect( () => {
		errors.map( ( error ) => {
			notices.error( error.message );
		} );
	}, [ errors ] );
}
