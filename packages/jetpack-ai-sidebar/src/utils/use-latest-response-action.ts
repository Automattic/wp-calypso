import { useCallback, useEffect, useRef } from '@wordpress/element';
import type { OnResponseAction } from './response-action';

/** Uses live host and post context, revoking dispatch when the response becomes stale or unmounts. */
export default function useLatestResponseAction(
	onResponseAction?: OnResponseAction,
	isResponseStale?: () => boolean
): OnResponseAction {
	const onResponseActionRef = useRef( onResponseAction );
	const isResponseStaleRef = useRef( isResponseStale );
	onResponseActionRef.current = onResponseAction;
	isResponseStaleRef.current = isResponseStale;
	useEffect( () => {
		onResponseActionRef.current = onResponseAction;
		isResponseStaleRef.current = isResponseStale;
		return () => {
			onResponseActionRef.current = undefined;
			isResponseStaleRef.current = undefined;
		};
	}, [ isResponseStale, onResponseAction ] );

	return useCallback< OnResponseAction >( ( action ) => {
		if ( isResponseStaleRef.current?.() ) {
			return;
		}
		onResponseActionRef.current?.( action );
	}, [] );
}
