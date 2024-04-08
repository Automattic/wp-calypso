import MySitesNavigation from 'calypso/my-sites/navigation';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export default function hostingOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = <div>foo</div>;

	next();
}
