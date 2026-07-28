/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { isEditorPage } from '../../utils/is-editor-page';
import useStyles from '../use-styles';

jest.mock( '../../utils/is-editor-page', () => ( {
	isEditorPage: jest.fn( () => true ),
} ) );

const mockEditEntityRecord = jest.fn();
let mockGlobalStylesId: string | null = 'global-styles-1';
const mockCurrentRecord = {
	settings: { color: { palette: { theme: [ { slug: 'primary', color: '#000' } ] } } },
	styles: {
		color: { text: '#000', background: '#fff' },
		elements: { button: { border: { radius: '4px', color: 'red' } } },
	},
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

describe( 'useStyles', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( isEditorPage as jest.Mock ).mockReturnValue( true );
		mockGlobalStylesId = 'global-styles-1';
	} );

	it( 'does not apply off the editor page', () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );
		const { result } = renderHook( () => useStyles() );

		let applied: boolean | undefined;
		act( () => {
			applied = result.current( { title: 'Bold', styles: {} } );
		} );

		expect( applied ).toBe( false );
		expect( mockEditEntityRecord ).not.toHaveBeenCalled();
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
				styles: expect.objectContaining( {
					color: { text: '#111', background: '#eee' },
				} ),
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

	it( 'does nothing and reports it when global styles ID is missing', () => {
		mockGlobalStylesId = null;
		const { result } = renderHook( () => useStyles() );

		let applied;
		act( () => {
			applied = result.current( { title: 'Test' } );
		} );

		expect( applied ).toBe( false );
		expect( mockEditEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'replaces the button border wholesale instead of key-merging it', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current( {
				title: 'Sharp',
				styles: { elements: { button: { border: { width: '2px', style: 'solid' } } } },
			} );
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		expect( merged.styles.elements.button.border ).toEqual( { width: '2px', style: 'solid' } );
	} );
} );
