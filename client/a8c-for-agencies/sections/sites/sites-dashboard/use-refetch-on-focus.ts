import debugFactory from 'debug';
import { useEffect, useState } from 'react';

const debug = debugFactory( 'calypso:a4a:sites-dashboard:use-refetch-on-focus' );

// The number of seconds within that must have passed before we allow an
// automatic refetch on focus.
const minimumFetchInterval = 60;

function convertMsToSecs( ms: number ): number {
	return Math.floor( ms / 1000 );
}

function isFocused(): boolean {
	return [ undefined, 'visible', 'prerender' ].includes( document.visibilityState );
}

function isOffline(): boolean {
	try {
		return ! window.navigator.onLine;
	} catch ( err ) {
		debug( 'failed to check onLine status; ignoring check', err );
		return false;
	}
}

export default function useRefetchOnFocus< T = any >( refetch: () => Promise< T > ): void {
	if ( isFocused() && isOffline() && convertMsToSecs( 1000 ) > minimumFetchInterval ) {
		refetch();
	}
	const [ lastRefreshTime, setLastRefreshTime ] = useState< number >(
		convertMsToSecs( Date.now() )
	);

	useEffect( () => {
		if ( ! refetch ) {
			debug( 'refetch falsy; not listening' );
			return;
		}

		function wasLastFetchRecent(): boolean {
			const nowInSeconds = convertMsToSecs( Date.now() );
			const secondsSinceLastFetch = nowInSeconds - lastRefreshTime;
			debug( 'last fetch was', secondsSinceLastFetch, 'seconds ago' );
			return secondsSinceLastFetch < minimumFetchInterval;
		}

		function handleFocusChange(): void {
			if ( ! isFocused() ) {
				debug( 'window was made invisible; ignoring' );
				return;
			}
			if ( wasLastFetchRecent() ) {
				debug( 'last fetch was quite recent; ignoring' );
				return;
			}
			if ( isOffline() ) {
				debug( 'network is offline; ignoring' );
				return;
			}

			debug( 'window was refocused; refetching' );
			const nowInSeconds = convertMsToSecs( Date.now() );
			setLastRefreshTime( nowInSeconds );
			refetch();
		}

		debug( 'adding focus listeners' );
		window.addEventListener( 'visibilitychange', handleFocusChange );
		window.addEventListener( 'focus', handleFocusChange );
		window.addEventListener( 'online', handleFocusChange );

		return () => {
			debug( 'removing focus listeners' );
			window.removeEventListener( 'visibilitychange', handleFocusChange );
			window.removeEventListener( 'focus', handleFocusChange );
			window.removeEventListener( 'online', handleFocusChange );
		};
	}, [ lastRefreshTime, refetch ] );
}
