import { Context as PageJSContext } from '@automattic/calypso-router';
import DevTools from 'calypso/dev-tools/components/dev-tools';

export function devTools( context: PageJSContext, next: () => void ) {
	context.primary = <DevTools />;
	next();
}
