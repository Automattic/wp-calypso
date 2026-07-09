import { getEditorContentBlocks } from './blocks';
import type { BlockSnapshot } from '../components/block-ref';

const rootBlocks: BlockSnapshot[] = [
	{
		clientId: 'header',
		name: 'core/template-part',
		innerBlocks: [],
	},
	{
		clientId: 'post-content',
		name: 'core/post-content',
		innerBlocks: [],
	},
	{
		clientId: 'footer',
		name: 'core/template-part',
		innerBlocks: [],
	},
];

const contentBlocks: BlockSnapshot[] = [
	{
		clientId: 'paragraph',
		name: 'core/paragraph',
		attributes: {
			content: 'Body copy',
		},
	},
];

describe( 'getEditorContentBlocks', () => {
	it( 'returns controlled post content blocks when a post-content block exists', () => {
		const getBlocks = jest.fn( ( rootClientId?: string ) =>
			rootClientId === 'post-content' ? contentBlocks : rootBlocks
		);

		expect(
			getEditorContentBlocks( {
				getBlocks,
				getBlocksByName: jest.fn( () => [ 'post-content' ] ),
			} )
		).toBe( contentBlocks );
		expect( getBlocks ).toHaveBeenCalledWith( 'post-content' );
	} );

	it( 'falls back to root blocks when no post-content block exists', () => {
		const getBlocks = jest.fn( () => rootBlocks );

		expect(
			getEditorContentBlocks( {
				getBlocks,
				getBlocksByName: jest.fn( () => [] ),
			} )
		).toBe( rootBlocks );
		expect( getBlocks ).toHaveBeenCalledWith();
	} );

	it( 'uses the experimental global block lookup when the stable lookup is unavailable', () => {
		const getBlocks = jest.fn( ( rootClientId?: string ) =>
			rootClientId === 'post-content' ? contentBlocks : rootBlocks
		);

		expect(
			getEditorContentBlocks( {
				getBlocks,
				__experimentalGetGlobalBlocksByName: jest.fn( () => [ 'post-content' ] ),
			} )
		).toBe( contentBlocks );
		expect( getBlocks ).toHaveBeenCalledWith( 'post-content' );
	} );

	it( 'returns an empty list when the block editor store is unavailable', () => {
		expect( getEditorContentBlocks() ).toEqual( [] );
		expect( getEditorContentBlocks( {} ) ).toEqual( [] );
	} );
} );
