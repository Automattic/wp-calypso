import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export type Next = ( error?: Error ) => void;

export function fetchPatterns( context: PageJSContext, next: Next ) {
	const { cachedMarkup, queryClient, lang, params, store } = context;

	if ( cachedMarkup ) {
		next();

		return;
	}

	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	// TODO: Get category from url
	params.category = 'intro';

	queryClient
		.fetchQuery( getPatternsQueryOptions( locale, params.category ) )
		.then( () => {
			next();
		} )
		.catch( ( error: Error ) => {
			next( error );
		} );
}
