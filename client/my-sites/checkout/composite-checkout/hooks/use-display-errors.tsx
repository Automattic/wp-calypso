/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';

export default function useDisplayErrors( errorMessages: string[] ) {
	const previousMessages = useRef< string[] >( [] );
	useEffect( () => {
		const messagesToDisplay = errorMessages.filter(
			( message ) => ! previousMessages.current.includes( message )
		);
		if ( messagesToDisplay.length > 0 ) {
			notices.error( messagesToDisplay.map( ( message ) => <p key={ message }>{ message }</p> ) );
		}
		previousMessages.current = messagesToDisplay;
	}, [ errorMessages ] );
}
