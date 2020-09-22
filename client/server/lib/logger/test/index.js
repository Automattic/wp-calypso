/**
 * Internal dependencies
 */
import { getLogger } from '../index';
import bunyan from 'bunyan';

/**
 * Mocks `bunyan` so every instance returned by `createLogger` logs to a buffer instead
 * of process.stdout. We can retrieve that buffer with `bunyan.getOutputBuffer()` and make
 * assertions on it.
 */
jest.mock( 'bunyan', () => {
	const realBunyan = jest.requireActual( 'bunyan' );
	const buffer = new realBunyan.RingBuffer( { limit: 100 } );

	return {
		createLogger: jest.fn( ( options ) => {
			return realBunyan.createLogger( {
				...options,
				streams: [ { type: 'raw', stream: buffer } ],
			} );
		} ),
		getOutputBuffer: () => buffer,
	};
} );

it( "Returns a logger with the name 'calypso'", () => {
	const buffer = bunyan.getOutputBuffer();

	getLogger().info( 'message' );

	expect( buffer.records ).toHaveLength( 1 );
	expect( buffer.records ).toEqual(
		expect.arrayContaining( [ expect.objectContaining( { name: 'calypso' } ) ] )
	);
} );

it( 'Reuses the same logger', () => {
	const logger1 = getLogger();
	const logger2 = getLogger();

	expect( logger1 ).toEqual( logger2 );
} );
