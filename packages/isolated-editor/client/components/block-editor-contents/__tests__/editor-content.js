import { registerCoreBlocks } from '@wordpress/block-library';
import getInitialEditorContent from '../editor-content';

beforeAll( () => {
	registerCoreBlocks();
} );

describe( 'BlockEditorContents', () => {
	const patterns = [
		{ name: 'test', content: '<!-- wp:paragraph --><p>test</p><!-- /wp:paragraph -->' },
	];

	describe( 'getInitialEditorContent', () => {
		it( 'returns initial content if undefined patterns', () => {
			expect( getInitialEditorContent( undefined, '', [], [ 'test' ] ) ).toEqual( [ 'test' ] );
		} );

		it( 'returns initial content if patterns', () => {
			expect( getInitialEditorContent( patterns, '', [], [ 'test' ] ) ).toEqual( [ 'test' ] );
		} );

		it( 'returns pattern if no initial content value', () => {
			const content = getInitialEditorContent( patterns, 'test', [], [] );

			expect( content.length ).toEqual( 1 );
			expect( content[ 0 ].name ).toEqual( 'core/paragraph' );
			expect( content[ 0 ].attributes.content ).toEqual( 'test' );
		} );

		it( 'returns empty content if unknown pattern', () => {
			expect( getInitialEditorContent( patterns, 'bad', [], [] ) ).toEqual( [] );
		} );

		it( 'returns empty content if no initial content, pattern, or template', () => {
			expect( getInitialEditorContent( [], '', [], [] ) ).toEqual( [] );
		} );
	} );
} );
