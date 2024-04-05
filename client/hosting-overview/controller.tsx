import type { Context as PageJSContext } from '@automattic/calypso-router';

export default function hostingOverview( context: PageJSContext, next: () => void ) {
	context.primary = <div>foo</div>;
	next();
}
