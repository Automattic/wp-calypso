/**
 * @jest-environment jsdom
 */
import { isEditorPage } from '../../../utils/is-editor-page';
import { showTemplate, showTemplateCallback } from '../callback';
import type { ShowTemplateIO } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn( () => undefined ),
	dispatch: jest.fn( () => undefined ),
	subscribe: jest.fn( () => () => {} ),
} ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '../../../utils/is-editor-page', () => ( {
	isEditorPage: jest.fn( () => true ),
} ) );

type IOOverrides = Partial< ShowTemplateIO > & {
	renderingModes?: Record< string, Record< string, string > >;
};

const setRenderingMode = jest.fn();
const setRenderingModes = jest.fn();

/**
 * A page in `post-only` on a themed site — the case the ability exists for.
 * @param overrides Fields to replace.
 */
function makeIO( overrides: IOOverrides = {} ): ShowTemplateIO {
	const { renderingModes, ...rest } = overrides;

	return {
		getRenderingMode: () => 'post-only',
		getCurrentPostType: () => 'page',
		getCurrentTemplateId: () => 'assembler//home',
		getStylesheet: () => 'assembler',
		getRenderingModes: () => renderingModes,
		setRenderingMode,
		setRenderingModes,
		waitForTemplateParts: () => Promise.resolve( true ),
		...rest,
	};
}

beforeEach( () => jest.clearAllMocks() );

describe( 'showTemplate', () => {
	it( 'turns the template on and persists the choice for this theme and post type', async () => {
		const result = await showTemplate( makeIO() );

		expect( setRenderingMode ).toHaveBeenCalledWith( 'template-locked' );
		expect( setRenderingModes ).toHaveBeenCalledWith( {
			assembler: { page: 'template-locked' },
		} );
		expect( result.result.success ).toBe( true );
		expect( result.result.details ).toMatchObject( {
			changed: true,
			persisted: true,
			templatePartsInView: true,
		} );
		expect( result.returnToAgent ).toBe( true );
	} );

	it( 'keeps other themes and post types when writing the preference', async () => {
		await showTemplate(
			makeIO( {
				renderingModes: {
					twentytwentyfour: { page: 'post-only' },
					assembler: { post: 'post-only' },
				},
			} )
		);

		expect( setRenderingModes ).toHaveBeenCalledWith( {
			twentytwentyfour: { page: 'post-only' },
			assembler: { post: 'post-only', page: 'template-locked' },
		} );
	} );

	// Easy mode forces `template-locked` on the store while deliberately never
	// writing the `core`-scope preference, which would follow the user into
	// every other editor. Returning before any write is what protects that.
	it( 'reports the template as already showing without writing anything', async () => {
		const result = await showTemplate( makeIO( { getRenderingMode: () => 'template-locked' } ) );

		expect( setRenderingMode ).not.toHaveBeenCalled();
		expect( setRenderingModes ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
		expect( result.result.details ).toMatchObject( { changed: false } );
	} );

	it.each( [ 'wp_template', 'wp_template_part' ] )(
		'refuses when the editor is open on a %s',
		async ( postType ) => {
			const result = await showTemplate( makeIO( { getCurrentPostType: () => postType } ) );

			expect( setRenderingMode ).not.toHaveBeenCalled();
			expect( setRenderingModes ).not.toHaveBeenCalled();
			expect( result.result.success ).toBe( false );
			expect( result.result.error ).toContain( postType );
		}
	);

	it( 'refuses when the page has no template', async () => {
		const result = await showTemplate( makeIO( { getCurrentTemplateId: () => undefined } ) );

		expect( setRenderingMode ).not.toHaveBeenCalled();
		expect( setRenderingModes ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'no template' );
	} );

	// The preference is keyed by theme, so an unresolved stylesheet has nothing
	// to key it under. The mode is still set: session-only beats failing.
	it( 'sets the mode without persisting when the stylesheet has not resolved', async () => {
		const result = await showTemplate( makeIO( { getStylesheet: () => undefined } ) );

		expect( setRenderingMode ).toHaveBeenCalledWith( 'template-locked' );
		expect( setRenderingModes ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
		expect( result.result.details ).toMatchObject( { persisted: false } );
	} );

	// A structure read taken before the parts land shows none of them, which is
	// the exact reading that makes the agent refuse — so say it plainly.
	it( 'still succeeds but says so when no part reaches the editor in time', async () => {
		const result = await showTemplate(
			makeIO( { waitForTemplateParts: () => Promise.resolve( false ) } )
		);

		expect( result.result.success ).toBe( true );
		expect( result.result.details ).toMatchObject( { templatePartsInView: false } );
		expect( result.result.details?.nextStep ).toContain( 'no template part has reached' );
	} );
} );

describe( 'showTemplateCallback', () => {
	it( 'refuses off an editor page without touching the editor', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );

		const result = await showTemplateCallback();

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'editor is not open' );
		expect( setRenderingMode ).not.toHaveBeenCalled();
	} );

	it( 'refuses when the editor store is unavailable', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( true );

		const result = await showTemplateCallback();

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'core/editor store is unavailable' );
	} );
} );
