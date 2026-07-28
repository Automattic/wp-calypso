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
const makeRecord = () => ( {
	settings: { color: { palette: { theme: [ { slug: 'primary', color: '#000' } ] } } },
	styles: {
		color: { text: '#000', background: '#fff' },
		elements: {
			button: {
				border: { radius: '4px', color: 'red' },
				spacing: { padding: '8px' },
				color: { background: '#fff', text: '#000' },
			} as Record< string, unknown >,
		},
	},
} );
let mockCurrentRecord = makeRecord();

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
		mockCurrentRecord = makeRecord();
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

	it( 'resets button border and spacing before merging a button variation', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current(
				{ title: 'Pill', styles: { elements: { button: { border: { radius: '100px' } } } } },
				'button'
			);
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		expect( merged.styles.elements.button ).toEqual( {
			border: { radius: '100px' },
			color: { background: '#fff', text: '#000' },
		} );
	} );

	it( 'stashes the previous button color when applying an outline variation', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current(
				{
					title: 'Rounded, Outline',
					styles: {
						elements: {
							button: {
								border: { radius: '100px', width: '2px' },
								color: {
									background: 'transparent !important',
									text: 'currentColor !important',
								},
							},
						},
					},
				},
				'button'
			);
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		expect( merged.styles.elements.button.buttonColor ).toEqual( {
			background: '#fff',
			text: '#000',
		} );
		expect( merged.styles.elements.button.color ).toEqual( {
			background: 'transparent !important',
			text: 'currentColor !important',
		} );
	} );

	it( 'strips the applied typography before merging a font variation', () => {
		mockCurrentRecord = {
			settings: { typography: { fluid: true } },
			styles: {
				typography: { fontFamily: 'Old' },
				elements: { h1: { typography: { fontWeight: '700' }, color: { text: '#111' } } },
			},
		} as unknown as ReturnType< typeof makeRecord >;
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current(
				{
					title: 'Modern Sans',
					settings: { typography: { fontFamilies: { theme: [ { name: 'Inter' } ] } } },
					styles: { elements: { h1: { typography: { fontFamily: 'Inter' } } } },
				} as never,
				'font'
			);
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		expect( merged.settings.typography ).toEqual( {
			fontFamilies: { theme: [ { name: 'Inter' } ] },
		} );
		expect( merged.styles.typography ).toBeUndefined();
		expect( merged.styles.elements.h1 ).toEqual( {
			color: { text: '#111' },
			typography: { fontFamily: 'Inter' },
		} );
	} );

	it( 'mirrors button styles onto the subscriptions block with !important', () => {
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current(
				{
					title: 'Pill',
					styles: {
						elements: {
							button: {
								border: { radius: '100px' },
								spacing: { padding: { left: '2rem', right: '2rem', top: '1rem' } },
							},
						},
					},
				},
				'button'
			);
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		const mirrored = merged.styles.blocks[ 'jetpack/subscriptions' ].elements.button;
		expect( mirrored.border ).toEqual( { radius: '100px !important' } );
		// Vertical padding is not mirrored — it would break the input height.
		expect( mirrored.spacing.padding ).toEqual( {
			left: '2rem !important',
			right: '2rem !important',
		} );
	} );

	it( 'restores the stashed button color when leaving an outline variation', () => {
		mockCurrentRecord.styles.elements.button = {
			border: { radius: '100px' },
			color: { background: 'transparent !important', text: 'currentColor !important' },
			buttonColor: { background: '#fff', text: '#000' },
		};
		const { result } = renderHook( () => useStyles() );

		act( () => {
			result.current(
				{ title: 'Square', styles: { elements: { button: { border: { radius: '0' } } } } },
				'button'
			);
		} );

		const merged = mockEditEntityRecord.mock.calls[ 0 ][ 3 ];
		expect( merged.styles.elements.button.color ).toEqual( { background: '#fff', text: '#000' } );
		expect( merged.styles.elements.button.border ).toEqual( { radius: '0' } );
	} );
} );
