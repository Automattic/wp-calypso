import { useEffect, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import type { LoadingMessage } from './types';

/**
 * Walk forward through a list of loading messages and hold on the last one.
 *
 * The list can change identity mid-wait (it depends on an intent that resolves
 * asynchronously), so the index resets whenever the list length changes.
 * @param loadingMessages The messages to walk through.
 * @returns The index of the message to display.
 */
export function useLoadingMessageIndex( loadingMessages: LoadingMessage[] ): number {
	const [ currentMessageIndex, setCurrentMessageIndex ] = useState( 0 );
	const lastMessageIndex = loadingMessages.length - 1;

	useEffect( () => {
		setCurrentMessageIndex( 0 );
	}, [ loadingMessages.length ] );

	useInterval(
		() => setCurrentMessageIndex( ( index ) => Math.min( index + 1, lastMessageIndex ) ),
		currentMessageIndex < lastMessageIndex ? loadingMessages[ currentMessageIndex ]?.duration : null
	);

	return Math.max( 0, Math.min( currentMessageIndex, lastMessageIndex ) );
}
