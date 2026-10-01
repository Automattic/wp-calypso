import { useDebounce } from '@wordpress/compose';
import { useEffect } from 'react';

const NAME_PULSE_URL_QUERY_PARAM = 'new';
const NAME_PULSE_URL_QUERY_DEBOUNCE_MS = 300;

const writeNamePulseUrlQuery = ( query?: string ) => {
	const url = new URL( window.location.href );

	if ( ( url.searchParams.get( NAME_PULSE_URL_QUERY_PARAM ) ?? '' ) === ( query ?? '' ) ) {
		return;
	}

	if ( query ) {
		url.searchParams.set( NAME_PULSE_URL_QUERY_PARAM, query );
	} else {
		url.searchParams.delete( NAME_PULSE_URL_QUERY_PARAM );
	}

	// replaceState adds no history entry and doesn't re-run the host router.
	window.history.replaceState( window.history.state, '', url.toString() );
};

/**
 * Mirrors the query into `?new=`, which the domain-only signup step reads on load,
 * so a refresh or a shared link restores the search. Debounced because the input
 * fires per keystroke and browsers throttle replaceState (Safari throws after 100
 * calls in 30s); clearing applies at once.
 */
export const useNamePulseUrlQuery = ( query?: string ) => {
	const debouncedWrite = useDebounce( writeNamePulseUrlQuery, NAME_PULSE_URL_QUERY_DEBOUNCE_MS );

	useEffect( () => {
		if ( query ) {
			debouncedWrite( query );
			return;
		}

		debouncedWrite.cancel();
		writeNamePulseUrlQuery();
	}, [ query, debouncedWrite ] );
};
