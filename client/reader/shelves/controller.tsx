import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { getShelfPath, parseShelfTab } from './routes';

const loadShelvesView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-shelves-view" */ 'calypso/reader/shelves/view'
	).then( ( { ShelvesView } ) => ( { default: ShelvesView } ) );

function ensureShelvesEnabled(): boolean {
	if ( ! isEnabled( 'reader/shelves' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const shelves = ( context: Context, next: () => void ) => {
	if ( ! ensureShelvesEnabled() ) {
		return;
	}
	const tab = parseShelfTab( context.params.tab );
	if ( tab === null ) {
		// Unknown tab slug — send to the shelf's canonical (feed) path.
		page.redirect( getShelfPath( context.params.slug ) );
		return;
	}
	context.primary = (
		<AsyncLoad
			require={ loadShelvesView }
			placeholder={ null }
			slug={ context.params.slug }
			tab={ tab }
		/>
	);
	next();
};
