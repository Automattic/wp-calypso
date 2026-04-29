import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';
import { DID_RE, HANDLE_RE, RKEY_RE } from './route';

const loadAtmosphereLandingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-landing-view" */ 'calypso/reader/atmosphere/atmosphere-landing-view'
	);
const loadAtmosphereConnectView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-connect-view" */ 'calypso/reader/atmosphere/atmosphere-connect-view'
	);
const loadAtmosphereAccountView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-account-view" */ 'calypso/reader/atmosphere/atmosphere-account-view'
	);
const loadAtmosphereThreadView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-thread-view" */ 'calypso/reader/atmosphere/atmosphere-thread-view'
	);
const loadAuthorProfileView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-author-profile-view" */ 'calypso/reader/atmosphere/author-profile-view'
	);

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
	context.primary = <AsyncLoad require={ loadAtmosphereLandingView } placeholder={ null } />;
	next();
};

export const atmosphereConnect = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadAtmosphereConnectView } placeholder={ null } />;
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
			require={ loadAtmosphereAccountView }
			placeholder={ null }
			connectionId={ id }
			tab={ tab }
		/>
	);
	next();
};

export const atmosphereThread = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const did = String( context.params.did ?? '' );
	const rkey = String( context.params.rkey ?? '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const inputsValid = idValid && DID_RE.test( did ) && RKEY_RE.test( rkey );

	if ( ! inputsValid ) {
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/atmosphere' );
		return;
	}

	context.primary = (
		<AsyncLoad
			require={ loadAtmosphereThreadView }
			placeholder={ null }
			connectionId={ id }
			did={ did }
			rkey={ rkey }
		/>
	);
	next();
};

export const atmosphereProfile = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const actorValid = HANDLE_RE.test( actor ) || DID_RE.test( actor );

	if ( ! idValid || ! actorValid ) {
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/atmosphere' );
		return;
	}

	context.primary = (
		<AsyncLoad
			require={ loadAuthorProfileView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};
