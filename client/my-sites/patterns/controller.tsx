import type { Context as PageJSContext } from '@automattic/calypso-router';
import wpcom from 'calypso/lib/wp';
import { getCurrentUserLocale, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getPatternSourceSiteID } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/constants';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';
import LoggedInComponent from './logged-in';
import LoggedOutComponent from './logged-out';

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
					site: getPatternSourceSiteID(),
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

const loggedIn = ( context: PageJSContext, next: Next ) => {
	context.primary = <LoggedInComponent />;

	next();
};

const loggedOut = ( context: PageJSContext, next: Next ) => {
	context.primary = <LoggedOutComponent patterns={ context.params.patterns } />;

	next();
};

export function renderPatterns( context: PageJSContext, next: Next ) {
	/*const state = context.store.getState();

	if ( isUserLoggedIn( state ) ) {
		return loggedIn( context, next );
	}*/

	return loggedOut( context, next );
}
