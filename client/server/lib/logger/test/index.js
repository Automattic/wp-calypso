/**
 * External dependencies
 */
import { mockProcessStdout } from 'jest-mock-process';
import mockFs from 'mock-fs';
import fs from 'fs';

let mockStdout;
let getLogger;

beforeEach( () => {
	( { getLogger } = require( '../index' ) );
	mockStdout = mockProcessStdout();
	mockFs( {
		'/tmp': {},
	} );
} );

afterEach( () => {
	jest.resetModules();
	mockStdout.mockRestore();
	delete process.env.CALYPSO_LOGFILE;
	mockFs.restore();
} );

it( "Returns a logger with the name 'calypso'", () => {
	const logger = getLogger();

	logger.info( 'message' );

	expect( mockStdout ).toHaveBeenCalledTimes( 1 );
	const loggedMessage = mockStdout.mock.calls[ 0 ][ 0 ];
	expect( JSON.parse( loggedMessage ) ).toEqual( expect.objectContaining( { name: 'calypso' } ) );
} );

it( 'Logs info and above levels to stdout', () => {
	const logger = getLogger();

	logger.trace( 'trace' ); // not logged
	logger.debug( 'debug' ); // not logged
	logger.info( 'info' );
	logger.warn( 'warn' );
	logger.error( 'error' );
	logger.fatal( 'fatal' );

	const loggedMessages = mockStdout.mock.calls.map( ( args ) => JSON.parse( args[ 0 ] ) );
	expect( loggedMessages ).toEqual( [
		expect.objectContaining( { msg: 'info', level: 30 } ),
		expect.objectContaining( { msg: 'warn', level: 40 } ),
		expect.objectContaining( { msg: 'error', level: 50 } ),
		expect.objectContaining( { msg: 'fatal', level: 60 } ),
	] );
} );

it( 'Logs info and above levels to the filesystem when the env variable is present', async () => {
	process.env.CALYPSO_LOGFILE = '/tmp/calypso.log';
	const logger = getLogger();

	logger.trace( 'trace' ); // not logged
	logger.debug( 'debug' ); // not logged
	logger.info( 'info' );
	logger.warn( 'warn' );
	logger.error( 'error' );
	logger.fatal( 'fatal' );

	const logLines = ( await fs.promises.readFile( '/tmp/calypso.log', 'utf8' ) )
		.split( '\n' )
		.filter( ( line ) => line.length > 0 )
		.map( JSON.parse );
	expect( logLines ).toEqual( [
		expect.objectContaining( { msg: 'info', level: 30 } ),
		expect.objectContaining( { msg: 'warn', level: 40 } ),
		expect.objectContaining( { msg: 'error', level: 50 } ),
		expect.objectContaining( { msg: 'fatal', level: 60 } ),
	] );
} );

it( 'Reuses the same logger', () => {
	const logger1 = getLogger();
	const logger2 = getLogger();

	expect( logger1 ).toEqual( logger2 );
} );
