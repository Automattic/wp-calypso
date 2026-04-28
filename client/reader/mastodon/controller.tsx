import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { TIMELINE_TAB } from './helper';

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
	context.primary = (
		<AsyncLoad
			key="reader-mastodon-landing"
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-reader-mastodon-landing-view" */ 'calypso/reader/mastodon/mastodon-landing-view'
				)
			}
			placeholder={ null }
		/>
	);
	next();
};

export const mastodonConnect = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	context.primary = (
		<AsyncLoad
			key="reader-mastodon-connect"
			require={ () => import( 'calypso/reader/mastodon/mastodon-connect-view' ) }
			placeholder={ null }
		/>
	);
	next();
};

export const mastodonOauthCallback = ( context: Context, next: () => void ) => {
	if ( ! ensureMastodonEnabled() ) {
		return;
	}
	const query = context.query as { state?: string; code?: string; error?: string };
	context.primary = (
		<AsyncLoad
			key="reader-mastodon-oauth-callback"
			require={ () => import( 'calypso/reader/mastodon/mastodon-oauth-callback-view' ) }
			placeholder={ null }
			query={ query }
		/>
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
			key="reader-mastodon-account"
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-reader-mastodon-account-view" */ 'calypso/reader/mastodon/mastodon-account-view'
				)
			}
			placeholder={ null }
			connectionId={ id }
			tab={ tab }
		/>
	);
	next();
};
