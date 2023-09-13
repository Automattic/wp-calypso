/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import defaultCalypsoI18n, { I18NContext } from 'i18n-calypso';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { state } from 'calypso/state/selectors/test/fixtures/theme-filters';
import useThemeShowcaseTitle from '../use-theme-showcase-title';

describe( 'useThemeShowcaseTitle()', () => {
	let wrapper;

	beforeEach( () => {
		const store = createStore( () => state );
		wrapper = ( { children } ) => (
			<I18NContext.Provider value={ defaultCalypsoI18n }>
				<Provider store={ store }>{ children }</Provider>
			</I18NContext.Provider>
		);
	} );

	test( 'should return the correct title for a known vertical', () => {
		const { result } = renderHook( () => useThemeShowcaseTitle( { vertical: 'business' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual( 'Business WordPress Themes' );
	} );

	test( 'should return the correct title for a known filter', () => {
		const { result } = renderHook( () => useThemeShowcaseTitle( { filter: 'minimal' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual( 'Minimal WordPress Themes' );
	} );

	test( 'should fall back to tier if multiple filters are specified', () => {
		const { result } = renderHook(
			() => useThemeShowcaseTitle( { filter: 'artwork+blog', tier: 'free' } ),
			{
				wrapper,
			}
		);
		expect( result.current ).toEqual( 'Free WordPress Themes' );
	} );

	test( 'should return correct title if only premium tier is specified', () => {
		const { result } = renderHook( () => useThemeShowcaseTitle( { tier: 'premium' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual( 'Premium WordPress Themes' );
	} );

	test( 'should return correct title if only free tier is specified', () => {
		const { result } = renderHook( () => useThemeShowcaseTitle( { tier: 'free' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual( 'Free WordPress Themes' );
	} );

	test( 'should return the generic Theme Showcase title if no additional args are provided', () => {
		const { result } = renderHook( () => useThemeShowcaseTitle(), {
			wrapper,
		} );
		expect( result.current ).toEqual( 'WordPress Themes' );
	} );
} );
