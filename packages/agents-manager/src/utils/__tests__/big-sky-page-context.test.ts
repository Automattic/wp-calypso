/**
 * @jest-environment jsdom
 */
import { bigSkyPageContextProvider } from '../big-sky-page-context';

jest.mock( '../../abilities', () => ( { getAmEditorPostContext: () => ( {} ) } ) );

describe( 'bigSkyPageContextProvider', () => {
	afterEach( () => {
		document.body.className = '';
	} );

	it.each( [
		{
			editor: 'a page',
			bodyClasses: [ 'post-php', 'post-type-page' ],
			expected: { client: 'page-editor' },
		},
		{
			editor: 'a new post',
			bodyClasses: [ 'post-new-php', 'post-type-post' ],
			expected: { client: 'post-editor' },
		},
		{
			editor: 'another post type',
			bodyClasses: [ 'post-php', 'post-type-product' ],
			expected: undefined,
		},
		{ editor: 'the site editor', bodyClasses: [ 'site-editor-php' ], expected: undefined },
	] )( 'names the editor client for $editor', ( { bodyClasses, expected } ) => {
		document.body.classList.add( ...bodyClasses );

		const { constructorArguments } = bigSkyPageContextProvider.getClientContext();

		expect( constructorArguments ).toEqual( expected );
	} );
} );
