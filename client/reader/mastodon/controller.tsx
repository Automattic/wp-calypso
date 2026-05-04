import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';
import { isValidActor, isValidHashtag, STATUS_ID_RE } from './route';

const loadMastodonLandingView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-mastodon-landing-view" */ 'calypso/reader/mastodon/mastodon-landing-view'
	);
const loadMastodonConnectView = () => import( 'calypso/reader/mastodon/mastodon-connect-view' );
const loadMastodonOauthCallbackView = () =>
	import( 'calypso/reader/mastodon/mastodon-oauth-callback-view' );
const loadMastodonAccountView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-mastodon-account-view" */ 'calypso/reader/mastodon/mastodon-account-view'
	);
const loadMastodonThreadView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-mastodon-thread-view" */ 'calypso/reader/mastodon/mastodon-thread-view'
	);
const loadMastodonAuthorProfileView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-mastodon-author-profile-view" */ 'calypso/reader/mastodon/author-profile-view'
	);
const loadMastodonTagFeedView = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-mastodon-tag-feed-view" */ 'calypso/reader/mastodon/tag-feed-view'
	);

function ensureMastodonEnabled(): boolean {
	if ( ! isEnabled( 'reader/social' ) ) {
		page.redirect( '/reader' );
		return false;
	}
	return true;
}

export const mastodonLanding = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadMastodonLandingView } placeholder={ null } />;
	next();
};

export const mastodonConnect = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	context.primary = <AsyncLoad require={ loadMastodonConnectView } placeholder={ null } />;
	next();
};

export const mastodonOauthCallback = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	const query = context.query as { state?: string; code?: string; error?: string };
	context.primary = (
		<AsyncLoad require={ loadMastodonOauthCallbackView } placeholder={ null } query={ query } />
	);
	next();
};

export const mastodonIdRedirect = ( context: Context ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	if ( Number.isFinite( id ) && id > 0 ) {
		page.redirect( `/reader/mastodon/${ id }/${ TIMELINE_TAB }` );
		return;
	}
	page.redirect( '/reader/mastodon' );
};

export const mastodonAccount = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	const id = Number( context.params.id );
	const tab = String( context.params.tab ?? '' );
	context.primary = (
		<AsyncLoad
			require={ loadMastodonAccountView }
			placeholder={ null }
			connectionId={ id }
			tab={ tab }
		/>
	);
	next();
};

export const mastodonThread = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const statusId = String( context.params.status_id ?? '' );

	const idValid = Number.isFinite( id ) && id > 0;
	const inputsValid = idValid && STATUS_ID_RE.test( statusId );

	if ( ! inputsValid ) {
		page.redirect( idValid ? `/reader/mastodon/${ id }` : '/reader/mastodon' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-mastodon-thread"
			require={ loadMastodonThreadView }
			placeholder={ null }
			connectionId={ id }
			statusId={ statusId }
		/>
	);
	next();
};

export const mastodonProfile = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}

	const id = Number( context.params.id );
	const actor = String( context.params.actor ?? '' ).trim();

	const idValid = Number.isFinite( id ) && id > 0;
	// Validate the actor against the same shape the URL builder allows so
	// a crafted route segment can't reach the panel and bounce through the
	// fetcher. Reject before mounting the AsyncLoad.
	const inputsValid = idValid && isValidActor( actor );

	if ( ! inputsValid ) {
		page.redirect( idValid ? `/reader/mastodon/${ id }` : '/reader/mastodon' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-mastodon-author-profile"
			require={ loadMastodonAuthorProfileView }
			placeholder={ null }
			connectionId={ id }
			actor={ actor }
		/>
	);
	next();
};

export const mastodonTagFeed = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
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
		page.redirect( idValid ? `/reader/mastodon/${ id }` : '/reader/mastodon' );
		return;
	}

	context.primary = (
		<AsyncLoad
			key="reader-mastodon-tag-feed"
			require={ loadMastodonTagFeedView }
			placeholder={ null }
			connectionId={ id }
			hashtag={ hashtag }
		/>
	);
	next();
};
