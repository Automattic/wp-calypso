import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';
import { DID_RE, HANDLE_RE, RKEY_RE, isValidHashtag } from './route';

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
const loadFollowersView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-followers-view" */ 'calypso/reader/atmosphere/followers-view'
	);
const loadFollowingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-following-view" */ 'calypso/reader/atmosphere/following-view'
	);
const loadAtmosphereTagFeedView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-atmosphere-tag-feed-view" */ 'calypso/reader/atmosphere/tag-feed-view'
	);

function ensureAtmosphereEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

/**
 * The bare `/reader/atmosphere` route used to render its own landing
 * view that figured out whether to redirect to a connection's timeline
 * or to the connect chooser. That decision now lives at
 * `/reader/connections`, so this handler just hands off — and keeps the
 * URL stable for any external bookmarks pointing at the old root.
 */
export const atmosphereLanding = () => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}
	page.redirect( '/reader/connections' );
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
	page.redirect( '/reader/connections' );
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
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/connections' );
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
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/connections' );
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

export const atmosphereProfileFollowers = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const actorValid = HANDLE_RE.test( actor ) || DID_RE.test( actor );

	if ( ! idValid || ! actorValid ) {
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			require={ loadFollowersView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};

export const atmosphereProfileFollowing = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const actorValid = HANDLE_RE.test( actor ) || DID_RE.test( actor );

	if ( ! idValid || ! actorValid ) {
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			require={ loadFollowingView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};

export const atmosphereTagFeed = ( context: Context, next: () => void ) => {
	if ( ! ensureAtmosphereEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const hashtag = String( context.params.hashtag ?? '' )
		.trim()
		.toLowerCase()
		.replace( /^#/, '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const inputsValid = idValid && isValidHashtag( hashtag );

	if ( ! inputsValid ) {
		page.redirect( idValid ? `/reader/atmosphere/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-atmosphere-tag-feed"
			require={ loadAtmosphereTagFeedView }
			placeholder={ null }
			connectionId={ id }
			hashtag={ hashtag }
		/>
	);
	next();
};
