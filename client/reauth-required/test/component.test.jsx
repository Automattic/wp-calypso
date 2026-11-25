/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ReauthRequired from '../component';

const mockListeners = [];

vi.mock( 'calypso/lib/two-step-authorization', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		on: ( event, listener ) => mockListeners.push( listener ),
		off: () => {},
		isReauthRequired: () => false,
	} )
);
vi.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: vi.fn( () => Promise.resolve() ),
} ) );
vi.mock( 'calypso/me/reauth-required', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );

describe( 'ReauthRequired', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		mockListeners.length = 0;
		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		window.location = originalLocation;
		vi.restoreAllMocks();
	} );

	function completeReauth( redirectTo ) {
		delete window.location;
		window.location = {
			origin: 'https://wordpress.com',
			search: `?redirect_to=${ encodeURIComponent( redirectTo ) }`,
			href: 'https://wordpress.com/me/reauth-required',
		};
		render( <ReauthRequired /> );
		mockListeners.forEach( ( listener ) => listener() );
		return window.location.href;
	}

	it.each( [
		[ '/me/security', 'https://wordpress.com/me/security' ],
		[ 'https://wordpress.com/sites', 'https://wordpress.com/sites' ],
		[ 'https://my.wordpress.com/sites', 'https://my.wordpress.com/sites' ],
	] )( 'redirects to trusted destination %s', ( redirectTo, expected ) => {
		expect( completeReauth( redirectTo ) ).toBe( expected );
	} );

	it.each( [ '//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)' ] )(
		'does not redirect to untrusted destination %s',
		( redirectTo ) => {
			expect( completeReauth( redirectTo ) ).toBe( 'https://wordpress.com/me/reauth-required' );
		}
	);
} );
