/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

/**
 * Run a callback for strings, but only new ones
 *
 * This hook accepts an array of strings and a callback. The callback is called
 * if any of the strings have not been passed to this hook previously. The
 * argument to the callback is an array of the strings that have not been
 * passed before.
 *
 * This can be used, for example, to record or display error messages.
 *
 * @param {string[]} messages - strings
 * @param {(messages: string[]) => void} handleMessages - the callback
 */
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
