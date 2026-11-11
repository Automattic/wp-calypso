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

	window.history.replaceState( window.history.state, '', url.toString() );
};

/**
 * Keeps the search in `?new=` so a refresh or a shared link restores it.
 * Read back on page load by the domain-only signup step.
 * Debounced because browsers limit how often the URL can change.
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
