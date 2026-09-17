jest.mock( '@wordpress/blocks', () => ( {
	serialize: jest.fn( ( blocks: { name: string }[] ) =>
		blocks.map( ( block ) => block.name ).join( ',' )
	),
} ) );
jest.mock( '../editor-blocks', () => ( {
	findPostContentClientId: jest.fn(),
	getRootBlocks: jest.fn( () => [] ),
} ) );

import { findPostContentClientId, getRootBlocks } from '../editor-blocks';
import { getPageContentMarkup } from '../page-content-markup';

beforeEach( () => jest.clearAllMocks() );

it( 'serializes the body of the post-content block', () => {
	( findPostContentClientId as jest.Mock ).mockReturnValue( 'pc' );
	( getRootBlocks as jest.Mock ).mockReturnValue( [
		{ name: 'core/heading' },
		{ name: 'core/paragraph' },
	] );

	expect( getPageContentMarkup() ).toBe( 'core/heading,core/paragraph' );
	expect( getRootBlocks ).toHaveBeenCalledWith( 'pc' );
} );

it.each( [
	// The document root has blocks, which are not the body of a post-content block.
	{ case: 'no post-content block', postContent: undefined, body: [ { name: 'core/paragraph' } ] },
	{ case: 'an empty body', postContent: 'pc', body: [] },
] )( 'is empty with $case', ( { postContent, body } ) => {
	( findPostContentClientId as jest.Mock ).mockReturnValue( postContent );
	( getRootBlocks as jest.Mock ).mockReturnValue( body );

	expect( getPageContentMarkup() ).toBe( '' );
} );

it( 'is empty when the editor cannot be read', () => {
	( findPostContentClientId as jest.Mock ).mockImplementationOnce( () => {
		throw new Error( 'no registry' );
	} );

	expect( getPageContentMarkup() ).toBe( '' );
} );
