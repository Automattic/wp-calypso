import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';

const loadFediverseAccountView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-account-view" */ 'calypso/reader/fediverse/fediverse-account-view'
	);
const loadFediverseAuthorProfileView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-author-profile-view" */ 'calypso/reader/fediverse/author-profile-view'
	);
const loadFediverseFollowersView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-followers-view" */ 'calypso/reader/fediverse/followers-view'
	);
const loadFediverseFollowingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-fediverse-following-view" */ 'calypso/reader/fediverse/following-view'
	);

function ensureSocialEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

/**
 * See note on `atmosphereLanding` — the unified `/reader/connections`
 * route now owns the "find a connection or send to chooser" decision.
 */
export const fediverseLanding = () => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	page.redirect( '/reader/connections' );
};

export const fediverseIdRedirect = ( context: Context ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	if ( Number.isFinite( id ) && id > 0 ) {
		page.redirect( `/reader/fediverse/${ id }/${ TIMELINE_TAB }` );
		return;
	}
	page.redirect( '/reader/connections' );
};

export const fediverseAccount = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
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

export const fediverseAuthorProfile = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' ).trim();

	const idValid = Number.isFinite( id ) && id > 0;
	if ( ! idValid || ! actor ) {
		page.redirect( idValid ? `/reader/fediverse/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-fediverse-author-profile"
			require={ loadFediverseAuthorProfileView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};

export const fediverseProfileFollowers = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' ).trim();

	const idValid = Number.isFinite( id ) && id > 0;
	if ( ! idValid || ! actor ) {
		page.redirect( idValid ? `/reader/fediverse/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-fediverse-followers"
			require={ loadFediverseFollowersView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};

export const fediverseProfileFollowing = ( context: Context, next: () => void ) => {
	if ( ! ensureSocialEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' ).trim();

	const idValid = Number.isFinite( id ) && id > 0;
	if ( ! idValid || ! actor ) {
		page.redirect( idValid ? `/reader/fediverse/${ id }` : '/reader/connections' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-fediverse-following"
			require={ loadFediverseFollowingView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};
