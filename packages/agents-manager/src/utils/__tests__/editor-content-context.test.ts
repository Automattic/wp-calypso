import { getBlockType, getBlockTypes } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { vi } from 'vitest';
import { getEditorContentContext } from '../editor-content-context';
import { getSelectedTextContext } from '../get-selected-text';
import { getEditedGlobalStyles } from '../global-styles';

vi.mock( '@wordpress/blocks', () => ( { getBlockType: vi.fn(), getBlockTypes: vi.fn() } ) );
vi.mock( '@wordpress/data', () => ( { select: vi.fn() } ) );
vi.mock( '@wordpress/core-data', () => ( { store: { name: 'core' } } ) );
vi.mock( '../global-styles', async () => ( {
	...( await vi.importActual< typeof import( '../global-styles' ) >( '../global-styles' ) ),
	getEditedGlobalStyles: vi.fn(),
} ) );
vi.mock( '../get-selected-text', () => ( { getSelectedTextContext: vi.fn() } ) );

const blockTypes = [
	{ name: 'core/paragraph', title: 'Paragraph', description: 'Text.', icon: 'p' },
	{ name: 'jetpack/map', title: 'Map', description: 'A map.' },
	{ name: 'acme/hero', title: 'Hero', description: 'A hero.', category: 'design', icon: 'h' },
];

const blockNames: Record< string, string > = {
	a: 'core/paragraph',
	b: 'jetpack/map',
	c: 'acme/hero',
	d: 'acme/hero',
	// On the page, but its plugin is gone.
	e: 'acme/retired',
};

function mockEditor( { hasBlocks }: { hasBlocks: boolean } ) {
	vi.mocked( getBlockTypes ).mockReturnValue( ( hasBlocks ? blockTypes : [] ) as never );
	vi.mocked( getBlockType ).mockImplementation(
		( name ) => blockTypes.find( ( type ) => type.name === name ) as never
	);
	vi.mocked( select ).mockReturnValue( {
		getClientIdsWithDescendants: () => ( hasBlocks ? Object.keys( blockNames ) : [] ),
		getBlockName: ( clientId: string ) => blockNames[ clientId ],
	} as never );
}

describe( 'getEditorContentContext', () => {
	it( 'sends the block names, the schemas of the blocks the agent does not know, the selection and the custom CSS', () => {
		mockEditor( { hasBlocks: true } );
		vi.mocked( getSelectedTextContext ).mockReturnValue( {
			text: 'Hi',
			attributeKey: 'content',
			start: 0,
			end: 2,
		} );
		vi.mocked( getEditedGlobalStyles ).mockReturnValue( {
			id: '1',
			record: { settings: {}, styles: { css: 'a { color: red; }' } },
		} );

		expect( getEditorContentContext() ).toEqual( {
			availableBlocks: [ 'core/paragraph', 'jetpack/map', 'acme/hero' ],
			blockSchema: [
				{ name: 'acme/hero', title: 'Hero', description: 'A hero.', category: 'design' },
			],
			selectedText: { text: 'Hi', attributeKey: 'content', start: 0, end: 2 },
			customCSS: 'a { color: red; }',
		} );
	} );

	it.each( [
		{ editor: 'holds none of it', mock: () => mockEditor( { hasBlocks: false } ) },
		{
			editor: 'cannot be read',
			mock: () =>
				vi.mocked( getBlockTypes ).mockImplementation( () => {
					throw new Error( 'No store' );
				} ),
		},
	] )( 'sends nothing when the editor $editor', ( { mock } ) => {
		mock();
		vi.mocked( getSelectedTextContext ).mockReturnValue( null );
		vi.mocked( getEditedGlobalStyles ).mockReturnValue( undefined );

		expect( getEditorContentContext() ).toEqual( {} );
	} );
} );
