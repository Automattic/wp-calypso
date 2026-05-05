import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';

const loadFediverseLandingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-landing-view" */ 'calypso/reader/fediverse/fediverse-landing-view'
	);
const loadFediverseConnectView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-connect-view" */ 'calypso/reader/fediverse/fediverse-connect-view'
	);
const loadFediverseOauthCallbackView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-oauth-callback-view" */ 'calypso/reader/fediverse/fediverse-oauth-callback-view'
	);
const loadFediverseAccountView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-account-view" */ 'calypso/reader/fediverse/fediverse-account-view'
	);

function ensureFediverseEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const fediverseLanding = ( context: Context, next: () => void ) => {
	if ( ! ensureFediverseEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadFediverseLandingView } placeholder={ null } />;
	next();
};

export const fediverseConnect = ( context: Context, next: () => void ) => {
	if ( ! ensureFediverseEnabled() ) {
		return;
	}
	const query = context.query as { error?: string };
	context.primary = (
		<AsyncLoad require={ loadFediverseConnectView } placeholder={ null } query={ query } />
	);
	next();
};

export const fediverseOauthCallback = ( context: Context, next: () => void ) => {
	if ( ! ensureFediverseEnabled() ) {
		return;
	}
	const query = context.query as { state?: string; code?: string; error?: string };
	context.primary = (
		<AsyncLoad require={ loadFediverseOauthCallbackView } placeholder={ null } query={ query } />
	);
	next();
};

export const fediverseIdRedirect = ( context: Context ) => {
	if ( ! ensureFediverseEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	if ( Number.isFinite( id ) && id > 0 ) {
		page.redirect( `/reader/fediverse/${ id }/${ TIMELINE_TAB }` );
		return;
	}
	page.redirect( '/reader/fediverse' );
};

export const fediverseAccount = ( context: Context, next: () => void ) => {
	if ( ! ensureFediverseEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const tab = String( context.params.tab ?? '' );
	context.primary = (
		<AsyncLoad
			require={ loadFediverseAccountView }
			placeholder={ null }
			connectionId={ id }
			tab={ tab }
		/>
	);
	next();
};
