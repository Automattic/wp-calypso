import { useCallback, useRef, useLayoutEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CallbackArgs = any[];

export type CallbackFunction< Args extends CallbackArgs, ReturnValue > = (
	...args: Args
) => ReturnValue;

/*
 * Return a stable callback function whose identity does not change.
 *
 * Even if the dependencies of the callback argument change, the returned
 * callback will keep the same identity. In effect, the returned callback will
 * always use the most recent version of the variables in the callback's
 * closure.
 *
 * This is a simple implementation of the (still-in-development at the time of
 * this commit) `useEvent` hook: https://beta.reactjs.org/apis/react/useEvent
 *
 * See https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md for
 * more explanation of why this is helpful.
 */
export function useStableCallback< Args extends CallbackArgs, ReturnValue >(
	handler: CallbackFunction< Args, ReturnValue >
): ( ...args: Args ) => ReturnValue {
	const handlerRef = useRef( handler );

	useLayoutEffect( () => {
		handlerRef.current = handler;
	} );

	return useCallback( ( ...args: Args ): ReturnValue => {
		const fn = handlerRef.current;
		return fn( ...args );
	}, [] );
}
