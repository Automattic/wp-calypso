import page from '@automattic/calypso-router';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const WORDPRESS_AGENT_PATH = '/me/get-apps/wordpress-agent';

export function wordpressAgent( context ) {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		page.replace( login( { redirectTo: window.location.href } ) );
		return;
	}

	const destination = new URL( '/me/agent', window.location.origin );
	if ( typeof context.query.pair_token === 'string' ) {
		destination.searchParams.set( 'pair_token', context.query.pair_token );
	}
	if ( typeof context.query.slack === 'string' ) {
		destination.searchParams.set( 'slack', context.query.slack );
	}
	window.location.replace( destination.toString() );
}
