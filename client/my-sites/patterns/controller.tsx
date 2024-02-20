import Patterns from 'calypso/my-sites/patterns/patterns';
import type { Context as PageJSContext } from '@automattic/calypso-router';

type Next = ( error?: Error ) => void;

export function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = <Patterns />;

	next();
}
