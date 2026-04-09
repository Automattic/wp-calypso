/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/blocks/login/utils/ensure-blackbox-login-script', () => ( {
	ensureBlackboxLoginScript: jest.fn( () => Promise.resolve() ),
} ) );

import { getBlackboxSessionId } from '../get-blackbox-session-id';

describe( 'getBlackboxSessionId', () => {
	afterEach( () => {
		delete window.Blackbox;
	} );

	test( 'returns session id when collect returns a string', async () => {
		window.Blackbox = {
			collect: jest.fn( () => Promise.resolve( 'session-id' ) ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( window.Blackbox.collect ).toHaveBeenCalled();
	} );

	test( 'returns session id when collect returns an object payload', async () => {
		window.Blackbox = {
			collect: jest.fn( () => Promise.resolve( { sessionId: 'session-id' } ) ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( window.Blackbox.collect ).toHaveBeenCalled();
	} );

	test( 'returns undefined when collect is missing', async () => {
		window.Blackbox = {
			reset: jest.fn(),
		};

		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
	} );

	test( 'awaits async collect result', async () => {
		window.Blackbox = {
			collect: jest.fn( () =>
				Promise.resolve().then( () => {
					return 'session-id';
				} )
			),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( window.Blackbox.collect ).toHaveBeenCalled();
	} );

	test( 'returns undefined when collect result has no session id', async () => {
		window.Blackbox = {
			collect: jest.fn( () => Promise.resolve( { error: true } ) ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
		expect( window.Blackbox.collect ).toHaveBeenCalled();
	} );
} );
