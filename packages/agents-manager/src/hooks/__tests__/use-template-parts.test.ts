/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useTemplateParts from '../use-template-parts';

const mockEditEntityRecord = jest.fn().mockResolvedValue( {} );
const mockGetCurrentTheme = jest.fn( () => ( { stylesheet: 'test-theme' } ) );
const mockGetEntityRecord = jest.fn( (): Record< string, unknown > | undefined => ( {
	id: 'test-id',
} ) );
const mockSerialize = jest.fn().mockReturnValue( '<!-- wp:paragraph -->' );

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/blocks', () => ( {
	serialize: ( ...args: unknown[] ) => mockSerialize( ...args ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			getCurrentTheme: mockGetCurrentTheme,
			getEntityRecord: mockGetEntityRecord,
		} ) ),
	useDispatch: () => ( { editEntityRecord: mockEditEntityRecord } ),
} ) );

describe( 'useTemplateParts', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'builds a template part ID from the current theme stylesheet', () => {
		const { result } = renderHook( () => useTemplateParts() );
		expect( result.current.buildTemplatePartId( 'header' ) ).toBe( 'test-theme//header' );
	} );

	it( 'edits a template part with serialized content', async () => {
		const { result } = renderHook( () => useTemplateParts() );
		const blocks = [ { name: 'core/paragraph' } ];

		await result.current.editTemplatePart( 'test-theme//header', blocks );

		expect( mockSerialize ).toHaveBeenCalledWith( blocks );
		expect( mockEditEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'wp_template_part',
			'test-theme//header',
			{ blocks, content: '<!-- wp:paragraph -->' }
		);
	} );

	it( 'skips editing when entity record is not found', async () => {
		mockGetEntityRecord.mockReturnValueOnce( undefined );
		const { result } = renderHook( () => useTemplateParts() );

		await result.current.editTemplatePart( 'test-theme//missing', [] );

		expect( mockEditEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'replaces a template part by name', async () => {
		const { result } = renderHook( () => useTemplateParts() );
		const blocks = [ { name: 'core/paragraph' } ];

		await result.current.replaceTemplatePart( 'header', blocks );

		expect( mockEditEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'wp_template_part',
			'test-theme//header',
			expect.objectContaining( { blocks } )
		);
	} );
} );
