import { Context as PageJSContext } from '@automattic/calypso-router';
import DevToolsPromo from 'calypso/dev-tools-promo/components/dev-tools-promo';

export function devToolsPromo( context: PageJSContext, next: () => void ) {
	context.primary = <DevToolsPromo />;
	next();
}
