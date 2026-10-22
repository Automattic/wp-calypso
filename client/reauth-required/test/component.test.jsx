/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ReauthRequired from '../component';

const mockListeners = [];

jest.mock( 'calypso/lib/two-step-authorization', () => ( {
	on: ( event, listener ) => mockListeners.push( listener ),
	off: () => {},
	isReauthRequired: () => false,
} ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );
jest.mock( 'calypso/me/reauth-required', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );

describe( 'ReauthRequired', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		mockListeners.length = 0;
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		window.location = originalLocation;
		jest.restoreAllMocks();
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
