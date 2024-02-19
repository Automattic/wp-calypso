import wpcom from 'calypso/lib/wp';
import { getCurrentUserLocale, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import Patterns from './patterns';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

type Next = ( error?: Error ) => void;

export const fetchPatterns = ( context: PageJSContext, next: Next ) => {
	if ( context.cachedMarkup ) {
		return next();
	}

	const currentUserLocale = getCurrentUserLocale( context.store.getState() ) || context.lang;

	const locale = currentUserLocale || 'en';

	context.queryClient
		.fetchQuery( {
			queryKey: [ locale, 'patterns' ],
			queryFn: () => {
				return wpcom.req.get( `/ptk/patterns/${ locale }`, {
					categories: 'intro',
					per_page: '5',
					post_type: 'wp_block',
				} );
			},
			staleTime: Infinity,
		} )
		.then( ( patterns: Pattern[] ) => {
			context.params.patterns = patterns;

			next();
		} )
		.catch( ( error: Error ) => {
			next( error );
		} );
};

export function renderPatterns( context: PageJSContext, next: Next ) {
	const state = context.store.getState();

	context.primary = (
		<Patterns isUserLoggedIn={ isUserLoggedIn( state ) } patterns={ context.params.patterns } />
	);

	next();
}
