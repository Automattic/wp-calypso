import wpcom from 'calypso/lib/wp';
import Patterns from 'calypso/my-sites/patterns/patterns';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

type Next = ( error?: Error ) => void;

export function fetchPatterns( context: PageJSContext, next: Next ) {
	const { queryClient, lang, store, cachedMarkup } = context;

	if ( cachedMarkup ) {
		next();

		return;
	}

	const locale = getCurrentUserLocale( store.getState() ) || lang || 'en';

	queryClient
		.fetchQuery( {
			queryKey: [ 'patterns', 'library', locale ],
			queryFn: () => {
				return wpcom.req.get( `/ptk/patterns/${ locale }`, {
					categories: 'intro',
					per_page: '4',
					post_type: 'wp_block',
				} );
			},
			staleTime: Infinity,
		} )
		.then( () => {
			next();
		} )
		.catch( ( error: Error ) => {
			next( error );
		} );
}

export function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = <Patterns />;

	next();
}
