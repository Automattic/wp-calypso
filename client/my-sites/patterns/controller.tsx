import Patterns from 'calypso/my-sites/patterns/patterns';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

type Next = ( error?: Error ) => void;

export function fetchPatterns( context: PageJSContext, next: Next ) {
	const locale = getCurrentUserLocale( context.store.getState() ) || context.lang || 'en';

	// eslint-disable-next-line no-console
	console.log( '############', locale );

	next();
}

export function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = <Patterns />;

	next();
}
