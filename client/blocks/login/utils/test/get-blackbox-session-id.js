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

	test( 'calls collect before getSessionId when both exist', async () => {
		const order = [];
		window.Blackbox = {
			collect: jest.fn( () => {
				order.push( 'collect' );
			} ),
			getSessionId: jest.fn( () => {
				order.push( 'getSessionId' );
				return Promise.resolve( 'session-id' );
			} ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( order ).toEqual( [ 'collect', 'getSessionId' ] );
	} );

	test( 'works when collect is missing', async () => {
		window.Blackbox = {
			getSessionId: jest.fn( () => Promise.resolve( 'session-id' ) ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( window.Blackbox.getSessionId ).toHaveBeenCalled();
	} );

	test( 'awaits async collect before getSessionId', async () => {
		const order = [];
		window.Blackbox = {
			collect: jest.fn( () =>
				Promise.resolve().then( () => {
					order.push( 'collect' );
				} )
			),
			getSessionId: jest.fn( () => {
				order.push( 'getSessionId' );
				return Promise.resolve( 'session-id' );
			} ),
		};

		await expect( getBlackboxSessionId() ).resolves.toBe( 'session-id' );
		expect( order ).toEqual( [ 'collect', 'getSessionId' ] );
	} );

	test( 'returns undefined when getSessionId is missing', async () => {
		window.Blackbox = {
			collect: jest.fn(),
		};

		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
		expect( window.Blackbox.collect ).not.toHaveBeenCalled();
	} );
} );
