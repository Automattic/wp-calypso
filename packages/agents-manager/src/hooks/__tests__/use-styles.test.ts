/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useStyles from '../use-styles';

const mockEditEntityRecord = jest.fn();
const mockInjectFontFamilies = jest.fn();
let mockGlobalStylesId: string | null = 'global-styles-1';
const mockCurrentRecord = {
	settings: { color: { palette: { theme: [ { slug: 'primary', color: '#000' } ] } } },
	styles: { color: { text: '#000', background: '#fff' } },
};

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( () => ( {
			__experimentalGetCurrentGlobalStylesId: () => mockGlobalStylesId,
			getEditedEntityRecord: () => ( mockGlobalStylesId ? mockCurrentRecord : null ),
		} ) ),
	useDispatch: () => ( { editEntityRecord: mockEditEntityRecord } ),
} ) );
jest.mock( '../../utils/font-families-to-css', () => ( {
	injectFontFamiliesIntoEditorIframe: ( ...args: unknown[] ) => mockInjectFontFamilies( ...args ),
} ) );

describe( 'useStyles', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGlobalStylesId = 'global-styles-1';
	} );

	it( 'merges variation into global styles', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current( {
				title: 'Bold',
				settings: { color: { palette: { theme: [ { slug: 'accent', color: '#f00' } ] } } },
				styles: { color: { text: '#111', background: '#eee' } },
			} );
		} );

		expect( mockEditEntityRecord ).toHaveBeenCalledWith(
			'root',
			'globalStyles',
			'global-styles-1',
			expect.objectContaining( {
				settings: { color: { palette: { theme: [ { slug: 'accent', color: '#f00' } ] } } },
				styles: { color: { text: '#111', background: '#eee' } },
			} )
		);
	} );

	it( 'keeps current settings when variation has no settings', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current( { title: 'Minimal', styles: { color: { text: '#222' } } } );
		} );

		expect( mockEditEntityRecord ).toHaveBeenCalledWith(
			'root',
			'globalStyles',
			'global-styles-1',
			expect.objectContaining( {
				settings: mockCurrentRecord.settings,
			} )
		);
	} );

	it( 'does nothing when global styles ID is missing', () => {
		mockGlobalStylesId = null;
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current( { title: 'Test' } );
		} );

		expect( mockEditEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'injects font families when `injectFonts` is true', () => {
		const families = [ { name: 'Inter', fontFamily: 'Inter' } ];
		const { result } = renderHook( () => useStyles( { injectFonts: true } ) );

		act( () => {
			result.current( {
				title: 'Modern Sans',
				settings: { typography: { fontFamilies: { theme: families } } },
				styles: { typography: { fontFamily: 'Inter' } },
			} );
		} );

		expect( mockInjectFontFamilies ).toHaveBeenCalledWith( families );
	} );

	it( 'does not inject fonts by default', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current( {
				title: 'Modern Sans',
				settings: {
					typography: { fontFamilies: { theme: [ { name: 'Inter', fontFamily: 'Inter' } ] } },
				},
				styles: {},
			} );
		} );

		expect( mockInjectFontFamilies ).not.toHaveBeenCalled();
	} );
} );
