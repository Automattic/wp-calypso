import page from '@automattic/calypso-router';
import { createElement } from 'react';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import WordPressAgentPage from './main';

export const WORDPRESS_AGENT_PATH = '/me/get-apps/wordpress-agent';

export function wordpressAgent( context, next ) {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		page.replace( login( { redirectTo: window.location.href } ) );
		return;
	}

	const pairToken = context.query.pair_token;
	if ( pairToken ) {
		const url = new URL( window.location.href );
		url.searchParams.delete( 'pair_token' );
		window.history.replaceState( window.history.state, '', url.toString() );
	}

	context.primary = createElement( WordPressAgentPage, {
		pairToken,
		slackStatus: context.query.slack,
	} );
	next();
}
