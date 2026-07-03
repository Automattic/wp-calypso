/**
 * @jest-environment jsdom
 */

import { bumpStat } from '../analytics';
import { isChunkLoadError, maybeReloadForChunkError } from '../chunk-load-recovery';

jest.mock( '../analytics', () => ( {
	bumpStat: jest.fn(),
} ) );

const mockedBumpStat = jest.mocked( bumpStat );

const replace = jest.fn();

const setLocation = ( search: string ) => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { href: `https://example.com/emails${ search }`, search, replace },
	} );
};

beforeEach( () => {
	jest.clearAllMocks();
	setLocation( '' );
} );

const chunkLoadError = () => {
	const error = new Error( 'Loading chunk emails failed.' );
	error.name = 'ChunkLoadError';
	return error;
};

describe( 'isChunkLoadError', () => {
	test( 'detects a webpack chunk failure by its ChunkLoadError name', () => {
		const error = new Error( 'Loading chunk 123 failed.' );
		error.name = 'ChunkLoadError';
		expect( isChunkLoadError( error ) ).toBe( true );
	} );

	test( 'detects a mini-css-extract chunk failure by its code', () => {
		const error = Object.assign( new Error( 'Loading CSS chunk 7 failed.' ), {
			code: 'CSS_CHUNK_LOAD_FAILED',
		} );
		expect( isChunkLoadError( error ) ).toBe( true );
	} );

	test( 'returns false for unrelated errors', () => {
		expect( isChunkLoadError( new Error( 'Cannot read properties of undefined' ) ) ).toBe( false );
	} );
} );

describe( 'maybeReloadForChunkError', () => {
	test( 'reloads with the retry flag on the first chunk load error', () => {
		const result = maybeReloadForChunkError( chunkLoadError() );

		expect( result ).toBe( true );
		expect( replace ).toHaveBeenCalledTimes( 1 );
		expect( replace ).toHaveBeenCalledWith( 'https://example.com/emails?retry=1' );
		expect( mockedBumpStat ).toHaveBeenCalledWith( 'calypso_chunk_retry', 'dashboard' );
	} );

	test( 'does not reload again once the retry flag is set', () => {
		setLocation( '?retry=1' );

		const result = maybeReloadForChunkError( chunkLoadError() );

		expect( result ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'does nothing for non-chunk errors', () => {
		const result = maybeReloadForChunkError( new Error( 'Boom' ) );

		expect( result ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
		expect( mockedBumpStat ).not.toHaveBeenCalled();
	} );
} );
