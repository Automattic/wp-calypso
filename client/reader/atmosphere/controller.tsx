import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';

function ensureAtmosphereEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const atmosphereLanding = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	context.primary = (
		<AsyncLoad
			key="reader-atmosphere-landing"
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-reader-atmosphere-landing-view" */ 'calypso/reader/atmosphere/atmosphere-landing-view'
				)
			}
			placeholder={ null }
		/>
	);
	next();
};

export const atmosphereConnect = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	context.primary = (
		<AsyncLoad
			key="reader-atmosphere-connect"
			require={ () =>
				/* webpackChunkName: "async-load-calypso-reader-atmosphere-connect-view" */ import(
					'calypso/reader/atmosphere/atmosphere-connect-view'
				)
			}
			placeholder={ null }
		/>
	);
	next();
};

export const atmosphereIdRedirect = ( context: Context ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	if ( Number.isFinite( id ) && id > 0 ) {
		page.redirect( `/reader/atmosphere/${ id }/${ TIMELINE_TAB }` );
		return;
	}
	page.redirect( '/reader/atmosphere' );
};

export const atmosphereAccount = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const tab = String( context.params.tab ?? '' );
	context.primary = (
		<AsyncLoad
			key="reader-atmosphere-account"
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-reader-atmosphere-account-view" */ 'calypso/reader/atmosphere/atmosphere-account-view'
				)
			}
			placeholder={ null }
			connectionId={ id }
			tab={ tab }
		/>
	);
	next();
};
