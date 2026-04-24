/**
 * @jest-environment jsdom
 */

jest.mock( '../blackbox-sdk', () => ( {
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

import { loadBlackboxSdk } from '../blackbox-sdk';
import { getBlackboxSessionId } from '../get-blackbox-session-id';

describe( 'getBlackboxSessionId', () => {
	afterEach( () => {
		delete window.Blackbox;
		jest.clearAllMocks();
	} );

	test( 'awaits loadBlackboxSdk before calling getSessionId', async () => {
		window.Blackbox = { getSessionId: jest.fn( () => Promise.resolve( 'sid' ) ) };

		await getBlackboxSessionId();

		expect( loadBlackboxSdk ).toHaveBeenCalled();
		expect( window.Blackbox.getSessionId ).toHaveBeenCalled();
	} );

	test( 'returns session id when getSessionId resolves a string', async () => {
		window.Blackbox = { getSessionId: jest.fn( () => Promise.resolve( 'abc123' ) ) };
		await expect( getBlackboxSessionId() ).resolves.toBe( 'abc123' );
	} );

	test( 'returns undefined when Blackbox is not loaded', async () => {
		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
	} );

	test( 'returns undefined when getSessionId is not a function', async () => {
		window.Blackbox = {};
		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
	} );

	test( 'returns undefined when getSessionId throws', async () => {
		window.Blackbox = { getSessionId: jest.fn( () => Promise.reject( new Error( 'boom' ) ) ) };
		await expect( getBlackboxSessionId() ).resolves.toBeUndefined();
	} );
} );
