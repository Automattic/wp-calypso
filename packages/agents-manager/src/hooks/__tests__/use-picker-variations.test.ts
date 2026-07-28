/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import usePickerVariations from '../use-picker-variations';
import type { GlobalStyles, StyleVariation } from '../../components/styles-preview';

const mockSetStyles = jest.fn( () => true );
jest.mock( '../use-styles', () => ( {
	__esModule: true,
	default: () => mockSetStyles,
} ) );

let mockGlobalStyles: GlobalStyles | null = null;
jest.mock( '../use-global-styles', () => ( {
	__esModule: true,
	default: () => ( { globalStylesId: null, globalStyles: mockGlobalStyles } ),
} ) );

const mockSetSiteEditorAction = jest.fn();
jest.mock( '../../utils/site-editor-context', () => ( {
	setSiteEditorAction: ( name: string, value: unknown ) => mockSetSiteEditorAction( name, value ),
} ) );

const mockRecordBigSkyTracksEvent = jest.fn();
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: ( name: string, props: unknown ) =>
		mockRecordBigSkyTracksEvent( name, props ),
} ) );

const variations = [
	{ title: 'Bold', settings: { value: 'bold' } },
	{ title: 'Pastel', settings: { value: 'pastel' } },
] as unknown as StyleVariation[];

const makeOptions = ( overrides = {} ) => ( {
	variations,
	getLiveValue: ( globalStyles: GlobalStyles ) => globalStyles.live,
	getValue: ( variation: StyleVariation ) => ( variation.settings as { value?: string } )?.value,
	createCurrent: ( liveValue: unknown ) =>
		( { settings: { value: liveValue } } ) as Omit< StyleVariation, 'title' >,
	...overrides,
} );

beforeEach( () => {
	jest.clearAllMocks();
	mockGlobalStyles = null;
} );

describe( 'usePickerVariations', () => {
	it( 'returns variations unsorted until the live value loads', () => {
		const { result } = renderHook( () => usePickerVariations( makeOptions() ) );

		expect( result.current.sortedVariations ).toEqual( variations );
		expect( result.current.activeTitle ).toBeNull();
	} );

	it( 'caps the variation list at 24 options', () => {
		const many = Array.from( { length: 30 }, ( _, index ) => ( {
			title: `Variation ${ index + 1 }`,
			settings: { value: `v${ index + 1 }` },
		} ) ) as unknown as StyleVariation[];
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variations: many } ) )
		);

		expect( result.current.sortedVariations ).toHaveLength( 24 );
	} );

	it( 'does not sort after the user has picked', () => {
		const { result, rerender } = renderHook( () => usePickerVariations( makeOptions() ) );

		act( () => {
			result.current.handleSelect( variations[ 1 ] );
		} );

		// A live value arriving after a pick must not reshuffle the grid.
		mockGlobalStyles = { live: 'pastel' };
		rerender();

		expect( result.current.sortedVariations.map( ( v ) => v.title ) ).toEqual( [
			'Bold',
			'Pastel',
		] );
	} );

	it( 'records the pick into the site editor actions', () => {
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variationType: 'color' } ) )
		);

		act( () => {
			result.current.handleSelect( variations[ 0 ] );
		} );

		expect( mockSetSiteEditorAction ).toHaveBeenCalledWith( 'colorPickerItemSelected', 'Bold' );
	} );

	it( 'moves the matching variation first and highlights it', () => {
		mockGlobalStyles = { live: 'pastel' };
		const { result } = renderHook( () => usePickerVariations( makeOptions() ) );

		expect( result.current.sortedVariations.map( ( v ) => v.title ) ).toEqual( [
			'Pastel',
			'Bold',
		] );
		expect( result.current.activeTitle ).toBe( 'Pastel' );
	} );

	it( 'prepends a synthetic "Current" variation when nothing matches', () => {
		mockGlobalStyles = { live: 'serif' };
		const { result } = renderHook( () => usePickerVariations( makeOptions() ) );

		expect( result.current.sortedVariations.map( ( v ) => v.title ) ).toEqual( [
			'Current',
			'Bold',
			'Pastel',
		] );
		expect( result.current.activeTitle ).toBe( 'Current' );
	} );

	it( 'applies the selection and highlights it', () => {
		const { result } = renderHook( () => usePickerVariations( makeOptions() ) );

		act( () => result.current.handleSelect( variations[ 1 ] ) );

		expect( mockSetStyles ).toHaveBeenCalledWith( variations[ 1 ], undefined );
		expect( result.current.activeTitle ).toBe( 'Pastel' );
	} );

	it( 'passes the variation type through to the apply', () => {
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variationType: 'button' } ) )
		);

		act( () => result.current.handleSelect( variations[ 0 ] ) );

		expect( mockSetStyles ).toHaveBeenCalledWith( variations[ 0 ], 'button' );
	} );

	it( "fires Big Sky's variation-click event on pick", () => {
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variationType: 'button' } ) )
		);

		act( () => result.current.handleSelect( variations[ 0 ] ) );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'button_variation_click', {
			button: 'Bold',
		} );
	} );

	it( 'keeps the picked variation highlighted when several share the live value', () => {
		const twins = [
			{ title: 'Twin A', settings: { value: { v: 'dup' } } },
			{ title: 'Twin B', settings: { value: { v: 'dup' } } },
		] as unknown as StyleVariation[];
		mockGlobalStyles = { live: { v: 'dup' } };
		const { result, rerender } = renderHook( () =>
			usePickerVariations( makeOptions( { variations: twins } ) )
		);

		act( () => result.current.handleSelect( twins[ 1 ] ) );
		// A fresh store read re-runs the highlight effect with an equal value.
		mockGlobalStyles = { live: { v: 'dup' } };
		rerender();

		expect( result.current.activeTitle ).toBe( 'Twin B' );
	} );

	it( 'does not highlight a selection that could not be applied', () => {
		mockSetStyles.mockReturnValueOnce( false );
		const { result } = renderHook( () => usePickerVariations( makeOptions() ) );

		act( () => result.current.handleSelect( variations[ 1 ] ) );

		expect( result.current.activeTitle ).toBeNull();
	} );

	it( 'drops falsy and duplicate-title variations', () => {
		const dirty = [
			variations[ 0 ],
			null,
			variations[ 0 ],
			variations[ 1 ],
		] as unknown as StyleVariation[];
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variations: dirty } ) )
		);

		expect( result.current.sortedVariations ).toEqual( variations );
	} );

	it( 'normalizes non-array variations to an empty list', () => {
		const { result } = renderHook( () =>
			usePickerVariations( makeOptions( { variations: 'nope' as unknown as StyleVariation[] } ) )
		);

		expect( result.current.sortedVariations ).toEqual( [] );
	} );
} );
