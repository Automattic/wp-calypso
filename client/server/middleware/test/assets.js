import { open } from 'fs/promises';
import middlewareAssets from '../assets';

jest.mock( 'fs/promises', () => ( { open: jest.fn() } ) );

describe( 'assets middleware', () => {
	let file;
	const assets = { manifests: [], assets: { reader: [ '/calypso/reader.js' ] } };

	beforeEach( () => {
		jest.clearAllMocks();
		file = {
			stat: jest.fn().mockResolvedValue( { mtimeMs: 1 } ),
			readFile: jest.fn().mockResolvedValue( JSON.stringify( assets ) ),
			close: jest.fn().mockResolvedValue( undefined ),
		};
		open.mockResolvedValue( file );
	} );

	it.each( [ 'stat', 'read', 'parse' ] )(
		'closes the file after a %s failure and permits the next request to recover',
		async ( failure ) => {
			if ( failure === 'stat' ) {
				file.stat.mockRejectedValueOnce( new Error( 'stat failed' ) );
			} else if ( failure === 'read' ) {
				file.readFile.mockRejectedValueOnce( new Error( 'read failed' ) );
			} else {
				file.readFile.mockResolvedValueOnce( '{' );
			}
			const middleware = middlewareAssets();
			const next = jest.fn();
			await middleware( {}, {}, next );
			expect( next ).toHaveBeenCalledWith( expect.any( Error ) );
			expect( file.close ).toHaveBeenCalledTimes( 1 );

			const request = {};
			await middleware( request, {}, jest.fn() );
			expect( request.getAssets() ).toEqual( assets );
			expect( file.close ).toHaveBeenCalledTimes( 2 );
		}
	);

	it( 'coalesces concurrent reads and reuses unchanged assets until the file changes', async () => {
		const middleware = middlewareAssets();
		const first = {};
		const second = {};
		await Promise.all( [
			middleware( first, {}, jest.fn() ),
			middleware( second, {}, jest.fn() ),
		] );
		expect( open ).toHaveBeenCalledTimes( 1 );
		expect( file.close ).toHaveBeenCalledTimes( 1 );
		expect( first.getAssets() ).toBe( second.getAssets() );

		const cached = {};
		await middleware( cached, {}, jest.fn() );
		expect( file.readFile ).toHaveBeenCalledTimes( 1 );
		expect( cached.getAssets() ).toBe( first.getAssets() );

		const updatedAssets = { ...assets, manifests: [ 'new runtime' ] };
		file.stat.mockResolvedValue( { mtimeMs: 2 } );
		file.readFile.mockResolvedValue( JSON.stringify( updatedAssets ) );
		const updated = {};
		await middleware( updated, {}, jest.fn() );
		expect( updated.getAssets() ).toEqual( updatedAssets );
		expect( file.readFile ).toHaveBeenCalledTimes( 2 );
		expect( file.close ).toHaveBeenCalledTimes( 3 );
	} );
} );
