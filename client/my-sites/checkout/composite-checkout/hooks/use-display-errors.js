/**
 * External dependencies
 */
import { useEffect } from 'react';

export default function useDisplayErrors( errors, displayError ) {
	useEffect( () => {
		errors.map( ( error ) => displayError( error.message ) );
	}, [ errors, displayError ] );
}
