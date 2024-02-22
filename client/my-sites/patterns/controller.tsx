import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/lib/get-patterns-query-options';
import Patterns from 'calypso/my-sites/patterns/patterns';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

type Next = ( error?: Error ) => void;

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

export function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = <Patterns category={ context.params.category } />;

	next();
}
