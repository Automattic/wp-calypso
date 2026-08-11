import { useEffect, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import type { LoadingMessage } from './types';

// Used when a message that is not the last one carries a duration the interval cannot honour.
// These lists are copy, edited by people who do not own this hook, and a delay of `Infinity`,
// `0` or `NaN` mid-list would otherwise hold that message for the whole wait.
const FALLBACK_DURATION_MS = 5000;

const durationOf = ( message?: LoadingMessage ): number => {
	const duration = message?.duration ?? 0;
	return Number.isFinite( duration ) && duration > 0 ? duration : FALLBACK_DURATION_MS;
};

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
		currentMessageIndex < lastMessageIndex
			? durationOf( loadingMessages[ currentMessageIndex ] )
			: null
	);

	return Math.max( 0, Math.min( currentMessageIndex, lastMessageIndex ) );
}
