/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

export default function useActOnceOnStrings(
	messages: string[],
	handleMessages: ( messages: string[] ) => void
) {
	const previousMessages = useRef< string[] >( [] );
	useEffect( () => {
		const newMessages = messages.filter(
			( message ) => ! previousMessages.current.includes( message )
		);
		if ( newMessages.length > 0 ) {
			handleMessages( newMessages );
		}
		previousMessages.current = newMessages;
	}, [ messages, handleMessages ] );
}
