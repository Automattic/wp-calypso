type TestBlock = {
	clientId: string;
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: TestBlock[];
};

jest.mock( '@wordpress/blocks', () => {
	const toTuples = ( blocks: TestBlock[] ): unknown[] =>
		blocks.map( ( { name, attributes, innerBlocks } ) => [
			name,
			attributes,
			toTuples( innerBlocks ),
		] );

	return {
		serialize: jest.fn( ( blocks: TestBlock[] ) => JSON.stringify( toTuples( blocks ) ) ),
		parse: jest.fn( ( content: string ) =>
			( JSON.parse( content ) as [ string, unknown, unknown[] ][] ).map(
				( [ name, attributes ], index ) => ( {
					clientId: `parsed-${ index }`,
					name,
					attributes,
					innerBlocks: [],
				} )
			)
		),
	};
} );

import { commitStreamedPageDesign } from '../commit';

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: TestBlock[] = []
): TestBlock => ( { clientId, name, attributes, innerBlocks } );

const adapters = ( live: unknown[] ) => ( {
	getLiveBlocks: jest.fn( () => live as never ),
	stageBlocks: jest.fn(),
	replaceBlocks: jest.fn(),
	clearSelection: jest.fn(),
} );

it( 'writes nothing when the design equals what was there', () => {
	const live = [ block( 'live-1', 'core/paragraph', { content: 'Hi' } ) ];
	const host = adapters( live );

	expect(
		commitStreamedPageDesign( host, [ block( 'old-1', 'core/paragraph', { content: 'Hi' } ) ] )
	).toBe( false );

	expect( host.clearSelection ).not.toHaveBeenCalled();
	expect( host.stageBlocks ).not.toHaveBeenCalled();
	expect( host.replaceBlocks ).not.toHaveBeenCalled();
} );

it( 'puts the old blocks back untracked, then writes fresh copies that keep the live ids', () => {
	const live = [
		block( 'live-1', 'core/group', {}, [ block( 'live-2', 'core/heading', { content: 'New' } ) ] ),
	];
	const host = adapters( live );
	const order: string[] = [];
	host.clearSelection.mockImplementation( () => order.push( 'clear' ) );
	host.stageBlocks.mockImplementation( () => order.push( 'stage' ) );
	host.replaceBlocks.mockImplementation( () => order.push( 'replace' ) );

	expect(
		commitStreamedPageDesign( host, [ block( 'old-1', 'core/paragraph', { content: 'Old' } ) ] )
	).toBe( true );

	expect( order ).toEqual( [ 'clear', 'stage', 'replace' ] );
	expect( host.stageBlocks ).toHaveBeenCalledWith( [
		expect.objectContaining( {
			clientId: 'parsed-0',
			name: 'core/paragraph',
			attributes: { content: 'Old' },
		} ),
	] );
	const [ written ] = host.replaceBlocks.mock.calls[ 0 ][ 0 ];
	expect( written ).toEqual( live[ 0 ] );
	expect( written ).not.toBe( live[ 0 ] );
	expect( written.innerBlocks[ 0 ] ).not.toBe( live[ 0 ].innerBlocks[ 0 ] );
} );

it( 'tells a changed child apart from an unchanged parent', () => {
	const host = adapters( [
		block( 'live-1', 'core/group', {}, [ block( 'live-2', 'core/heading' ) ] ),
	] );

	expect(
		commitStreamedPageDesign( host, [
			block( 'old-1', 'core/group', {}, [ block( 'old-2', 'core/paragraph' ) ] ),
		] )
	).toBe( true );
} );

it( 'leaves malformed blocks out of both writes', () => {
	const host = adapters( [ block( 'live-1', 'core/heading' ), { clientId: 'broken' } ] );

	commitStreamedPageDesign( host, [
		block( 'old-1', 'core/paragraph' ),
		{ name: 'core/spacer' } as never,
	] );

	expect( host.stageBlocks ).toHaveBeenCalledWith( [
		expect.objectContaining( { name: 'core/paragraph' } ),
	] );
	expect( host.replaceBlocks ).toHaveBeenCalledWith( [
		expect.objectContaining( { clientId: 'live-1' } ),
	] );
} );
