import { select } from '@wordpress/data';
import { getBlockSuggestions, getEditorEmptyViewSuggestions } from '../editor-suggestions';
import type { EditorBlock } from '../editor-blocks';
import type { Suggestion } from '@automattic/agenttic-ui';

jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const TEXT_IDS = [ 'translate', 'change-tone', 'check-grammar' ];
const IMAGE_IDS = [ 'generate-image', 'edit-image', 'remove-image-background' ];
const QUERY_IDS = [ 'change-number-of-posts', 'order-posts' ];

function block(
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock {
	return { clientId: name, name, attributes, innerBlocks };
}

const getIds = ( suggestions: Suggestion[] ) => suggestions.map( ( { id } ) => id );

describe( 'getEditorEmptyViewSuggestions', () => {
	const ALL_IDS = [
		'customize-colors',
		'change-page-layout',
		'choose-new-fonts',
		'edit-pages',
		'what-else-can-i-do',
	];
	const NON_ASSEMBLER_IDS = [ 'customize-colors', 'choose-new-fonts', 'what-else-can-i-do' ];

	it.each( [
		[ 'the Assembler theme', { stylesheet: 'pub/assembler' }, ALL_IDS ],
		[ 'another theme', { stylesheet: 'pub/twentytwentyfive' }, NON_ASSEMBLER_IDS ],
		[ 'a theme that has not loaded yet', undefined, NON_ASSEMBLER_IDS ],
	] )( 'offers the design actions for %s', ( _theme, theme, expectedIds ) => {
		jest.mocked( select ).mockReturnValue( {
			getCurrentTheme: () => theme,
		} as unknown as ReturnType< typeof select > );

		expect( getIds( getEditorEmptyViewSuggestions() ) ).toEqual( expectedIds );
	} );
} );

describe( 'getBlockSuggestions', () => {
	it.each( [
		[ 'a button', block( 'core/button' ), [ 'edit-link' ] ],
		[ 'a paragraph', block( 'core/paragraph' ), TEXT_IDS ],
		[ 'a heading', block( 'core/heading' ), TEXT_IDS ],
		[ 'an image', block( 'core/image' ), IMAGE_IDS ],
		[ 'a query', block( 'core/query' ), QUERY_IDS ],
		[
			'a group with columns and a nested query',
			block( 'core/group', {}, [
				block( 'core/columns' ),
				block( 'core/group', {}, [ block( 'core/query' ) ] ),
			] ),
			[ 'add-column', 'columns-within-group', ...QUERY_IDS ],
		],
		[ 'a group without columns or a query', block( 'core/group' ), [] ],
		[ 'any other block', block( 'core/list' ), [] ],
	] )( 'offers %s its actions', ( _name, selectedBlock, expectedIds ) => {
		expect( getIds( getBlockSuggestions( selectedBlock ) ) ).toEqual( expectedIds );
	} );

	it.each( [
		[
			'the defaults',
			{},
			'Currently this query is displaying 10 posts per page, change it to:',
			'By updating the query, order posts from oldest to newest',
		],
		[
			'inherited settings in ascending order',
			{ inherit: true, order: 'asc', perPage: 6 },
			'Stop inheriting default query settings and change the current number of posts displayed per page from 6 to:',
			'Stop inheriting default query settings and order posts from newest to oldest',
		],
	] )(
		'words the query actions for %s',
		( _settings, query, expectedNumberPrompt, expectedOrderPrompt ) => {
			const [ numberOfPosts, orderPosts ] = getBlockSuggestions( block( 'core/query', { query } ) );

			expect( numberOfPosts.prompt ).toBe( expectedNumberPrompt );
			expect( orderPosts.prompt ).toBe( expectedOrderPrompt );
		}
	);

	describe( 'with the Jetpack AI sidebar on', () => {
		beforeEach( () => {
			( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = {
				jetpackAiSidebar: { enabled: true },
			};
		} );

		afterEach( () => {
			delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } )
				.agentsManagerData;
		} );

		it.each( [
			[ 'a paragraph', block( 'core/paragraph' ) ],
			[ 'a heading', block( 'core/heading' ) ],
			[ 'an image', block( 'core/image' ) ],
		] )( 'leaves %s to the sidebar', ( _name, selectedBlock ) => {
			expect( getBlockSuggestions( selectedBlock ) ).toEqual( [] );
		} );

		it( 'still offers the other blocks their actions', () => {
			expect( getIds( getBlockSuggestions( block( 'core/button' ) ) ) ).toEqual( [ 'edit-link' ] );
		} );
	} );

	it( 'builds the button prompt from its text', () => {
		expect( getBlockSuggestions( block( 'core/button', { text: 'Buy now' } ) ) ).toEqual( [
			{ id: 'edit-link', label: 'Edit link', prompt: 'Change the Buy now button link to:' },
		] );
	} );

	it( 'returns no more than the limit, keeping the order', () => {
		const group = block( 'core/group', {}, [ block( 'core/columns' ), block( 'core/query' ) ] );

		expect( getIds( getBlockSuggestions( group, 3 ) ) ).toEqual( [
			'add-column',
			'columns-within-group',
			'change-number-of-posts',
		] );
	} );
} );
