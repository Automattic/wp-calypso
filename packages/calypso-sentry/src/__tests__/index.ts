import { vi } from 'vitest';
import { captureException, initSentry, setUser } from '../index';

vi.mock( '@automattic/calypso-config', () => ( {
	default: Object.assign( () => 'test', {
		isEnabled: ( flag: string ) => flag === 'always-enable-sentry',
	} ),
} ) );

// The Dashboard starts Sentry before it knows the user and calls setUser later; Sentry 10 keeps
// initialScope and setUser on different scopes, so an empty initial user would hide the real one.
test( 'reports the user set after initialization', async () => {
	const fetch = vi.fn( () => Promise.resolve( new Response( '{}' ) ) );
	vi.stubGlobal( 'fetch', fetch );

	await initSentry();
	setUser( { id: '123' } );
	captureException( new Error( 'test error' ) );

	await vi.waitFor( () => expect( fetch ).toHaveBeenCalled() );
	const body = fetch.mock.calls[ 0 ][ 1 ].body as URLSearchParams;
	expect( JSON.parse( body.get( 'params' ) as string ).user_id ).toBe( 123 );
} );
