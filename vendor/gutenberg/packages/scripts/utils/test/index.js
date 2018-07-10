jest.mock( '../package', () => {
	const module = require.requireActual( '../package' );

	jest.spyOn( module, 'getPackagePath' );

	return module;
} );
jest.mock( '../process', () => {
	const module = require.requireActual( '../process' );

	jest.spyOn( module, 'exit' );
	jest.spyOn( module, 'getCliArgs' );

	return module;
} );
/**
 * Internal dependencies
 */
import crossSpawn from 'cross-spawn';
import {
	hasCliArg,
	hasProjectFile,
	spawnScript,
} from '../';
import {
	getPackagePath as getPackagePathMock,
} from '../package';
import {
	exit as exitMock,
	getCliArgs as getCliArgsMock,
} from '../process';

describe( 'utils', () => {
	const crossSpawnMock = jest.spyOn( crossSpawn, 'sync' );

	describe( 'hasCliArg', () => {
		beforeAll( () => {
			getCliArgsMock.mockReturnValue( [ '-a', '--b', '--config=test' ] );
		} );

		afterAll( () => {
			getCliArgsMock.mockReset();
		} );

		test( 'should return false when no args passed', () => {
			getCliArgsMock.mockReturnValueOnce( [] );

			expect( hasCliArg( '--no-args' ) ).toBe( false );
		} );

		test( 'should return false when checking for unrecognized arg', () => {
			expect( hasCliArg( '--non-existent' ) ).toBe( false );
		} );

		test( 'should return true when CLI arg found', () => {
			expect( hasCliArg( '-a' ) ).toBe( true );
			expect( hasCliArg( '--b' ) ).toBe( true );
			expect( hasCliArg( '--config' ) ).toBe( true );
		} );
	} );

	describe( 'hasProjectFile', () => {
		test( 'should return false for the current directory and unknown file', () => {
			getPackagePathMock.mockReturnValueOnce( __dirname );

			expect( hasProjectFile( 'unknown-file.name' ) ).toBe( false );
		} );

		test( 'should return true for the current directory and this file', () => {
			getPackagePathMock.mockReturnValueOnce( __dirname );

			expect( hasProjectFile( 'index.js' ) ).toBe( true );
		} );
	} );

	describe( 'spawnScript', () => {
		const scriptName = 'test-unit-js';

		beforeAll( () => {
			exitMock.mockImplementation( ( code ) => {
				throw new Error( `Exit code: ${ code }.` );
			} );
		} );

		afterAll( () => {
			exitMock.mockReset();
		} );

		test( 'should exit when no script name provided', () => {
			expect( () => spawnScript() ).toThrow( 'Exit code: 1.' );
			expect( console ).toHaveLoggedWith( 'Script name is missing.' );
		} );

		test( 'should exit when an unknown script name provided', () => {
			expect( () => spawnScript( 'unknown-script' ) ).toThrow( 'Exit code: 1.' );
			expect( console ).toHaveLoggedWith(
				'Unknown script "unknown-script". Perhaps you need to update @wordpress/scripts?'
			);
		} );

		test( 'should exit when the script failed because of SIGKILL signal', () => {
			crossSpawnMock.mockReturnValueOnce( { signal: 'SIGKILL' } );

			expect( () => spawnScript( scriptName ) ).toThrow( 'Exit code: 1.' );
			expect( console ).toHaveLogged();
		} );

		test( 'should exit when the script failed because of SIGTERM signal', () => {
			crossSpawnMock.mockReturnValueOnce( { signal: 'SIGTERM' } );

			expect( () => spawnScript( scriptName ) ).toThrow( 'Exit code: 1.' );
			expect( console ).toHaveLogged();
		} );

		test( 'should finish successfully when the script properly executed', () => {
			crossSpawnMock.mockReturnValueOnce( { status: 0 } );

			expect( () => spawnScript( scriptName ) ).toThrow( 'Exit code: 0.' );
			expect( crossSpawnMock ).toHaveBeenCalledWith(
				'node', [ expect.stringContaining( scriptName ) ], { stdio: 'inherit' }
			);
		} );

		test( 'should finish successfully when the script properly executed with args', () => {
			crossSpawnMock.mockReturnValueOnce( { status: 0 } );
			const args = [ '-a', '--bbb', '-c=ccccc' ];

			expect( () => spawnScript( scriptName, args ) ).toThrow( 'Exit code: 0.' );
			expect( crossSpawnMock ).toHaveBeenCalledWith(
				'node', [ expect.stringContaining( scriptName ), ...args ], { stdio: 'inherit' }
			);
		} );
	} );
} );
