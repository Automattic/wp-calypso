/**
 * @jest-environment jsdom
 */

import { hasForcedUnifiedAgent } from '../force-unified-agent';

function visit( url: string ) {
	window.history.replaceState( {}, '', url );
}

// jsdom fixes the origin at construction, so swap the hostname directly.
function setHost( hostname: string ) {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, hostname, search: window.location.search },
	} );
}

beforeEach( () => {
	window.sessionStorage.clear();
	visit( '/' );
	setHost( 'calypso.localhost' );
} );

describe( 'hasForcedUnifiedAgent', () => {
	it( 'is off without the param', () => {
		expect( hasForcedUnifiedAgent() ).toBe( false );
	} );

	it( 'turns on for `1` on a local host', () => {
		setHost( 'calypso.localhost' );
		Object.defineProperty( window.location, 'search', {
			configurable: true,
			value: '?force-unified-agent=1',
		} );

		expect( hasForcedUnifiedAgent() ).toBe( true );
	} );

	it( 'sticks for the session once set', () => {
		Object.defineProperty( window.location, 'search', {
			configurable: true,
			value: '?force-unified-agent=1',
		} );
		expect( hasForcedUnifiedAgent() ).toBe( true );

		Object.defineProperty( window.location, 'search', { configurable: true, value: '' } );
		expect( hasForcedUnifiedAgent() ).toBe( true );
	} );

	it( 'clears with `0`', () => {
		Object.defineProperty( window.location, 'search', {
			configurable: true,
			value: '?force-unified-agent=1',
		} );
		expect( hasForcedUnifiedAgent() ).toBe( true );

		Object.defineProperty( window.location, 'search', {
			configurable: true,
			value: '?force-unified-agent=0',
		} );
		expect( hasForcedUnifiedAgent() ).toBe( false );

		Object.defineProperty( window.location, 'search', { configurable: true, value: '' } );
		expect( hasForcedUnifiedAgent() ).toBe( false );
	} );

	it.each( [ 'wordpress.com', 'cloud.jetpack.com', 'example.com' ] )(
		'never applies on %s',
		( hostname ) => {
			setHost( hostname );
			Object.defineProperty( window.location, 'search', {
				configurable: true,
				value: '?force-unified-agent=1',
			} );

			expect( hasForcedUnifiedAgent() ).toBe( false );
			expect( window.sessionStorage.getItem( 'agents-manager-force-unified-agent' ) ).toBeNull();
		}
	);

	it.each( [ 'localhost', 'calypso.localhost', 'foo.jurassic.tube', 'bar.jurassic.ninja' ] )(
		'applies on %s',
		( hostname ) => {
			setHost( hostname );
			Object.defineProperty( window.location, 'search', {
				configurable: true,
				value: '?force-unified-agent=1',
			} );

			expect( hasForcedUnifiedAgent() ).toBe( true );
		}
	);
} );
