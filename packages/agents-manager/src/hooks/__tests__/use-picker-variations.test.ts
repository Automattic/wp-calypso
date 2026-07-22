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

		expect( mockSetStyles ).toHaveBeenCalledWith( variations[ 1 ] );
		expect( result.current.activeTitle ).toBe( 'Pastel' );
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
