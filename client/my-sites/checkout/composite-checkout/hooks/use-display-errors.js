/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';

export default function useDisplayErrors( errorMessages ) {
	const previousMessages = useRef( [] );
	useEffect( () => {
		const messagesToDisplay = errorMessages.filter(
			( message ) => ! previousMessages.current.includes( message )
		);
		if ( messagesToDisplay.length > 0 ) {
			notices.error(
				messagesToDisplay.errors.map( ( message ) => <p key={ message }>{ message }</p> )
			);
		}
		previousMessages.current = messagesToDisplay;
	}, [ errorMessages ] );
}
