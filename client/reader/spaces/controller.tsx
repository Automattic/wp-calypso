import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { getSpacePath, parseSpaceTab } from './routes';

const loadSpacesView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-spaces-view" */ 'calypso/reader/spaces/view'
	).then( ( { SpacesView } ) => ( { default: SpacesView } ) );

function ensureSpacesEnabled(): boolean {
	if ( ! isEnabled( 'reader/spaces' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const spaces = ( context: Context, next: () => void ) => {
	if ( ! ensureSpacesEnabled() ) {
		return;
	}
	const tab = parseSpaceTab( context.params.tab );
	if ( tab === null ) {
		// Unknown tab slug — send to the space's canonical (feed) path.
		page.redirect( getSpacePath( context.params.id ) );
		return;
	}
	context.primary = (
		<AsyncLoad
			require={ loadSpacesView }
			placeholder={ null }
			id={ context.params.id }
			tab={ tab }
		/>
	);
	next();
};
