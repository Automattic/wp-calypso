/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { fetchReaderTeams } from '../rest-client/wpcom';

export default function FontSmoothing() {
	useEffect( () => {
		let cancel = false;

		fetchReaderTeams( ( error, response ) => {
			if ( cancel || error ) {
				return;
			}

			if ( ( response?.teams || [] ).find( ( team ) => team?.slug === 'a8c' ) ) {
				document.body.classList.add( 'font-smoothing-antialiased' );
			}
		} );

		return () => {
			cancel = true;
			document.body.classList.remove( 'font-smoothing-antialiased' );
		};
	}, [] );

	return null;
}
