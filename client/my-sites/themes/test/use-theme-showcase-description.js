/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import defaultCalypsoI18n, { I18NContext } from 'i18n-calypso';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { state } from 'calypso/state/selectors/test/fixtures/theme-filters';
import useThemeShowcaseDescription from '../use-theme-showcase-description';

describe( 'useThemeShowcaseDescription()', () => {
	let wrapper;

	beforeEach( () => {
		const store = createStore( () => state );
		wrapper = ( { children } ) => (
			<I18NContext.Provider value={ defaultCalypsoI18n }>
				<Provider store={ store }>{ children }</Provider>
			</I18NContext.Provider>
		);
	} );

	test( 'should return the vertical description for a known vertical', () => {
		const { result } = renderHook( () => useThemeShowcaseDescription( { vertical: 'blog' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual(
			"Whether you're authoring a personal blog, professional blog, or a business blog — ..."
		);
	} );

	test( 'should return the filter description for a known filter', () => {
		const { result } = renderHook( () => useThemeShowcaseDescription( { filter: 'minimal' } ), {
			wrapper,
		} );
		expect( result.current ).toEqual(
			"Whether you're minimalist at heart, like keeping things clean, or just want to focus — ..."
		);
	} );

	test( 'should fall back to generic vertical description for an unknown vertical', () => {
		const { result } = renderHook(
			() => useThemeShowcaseDescription( { vertical: 'blahg', tier: 'free' } ),
			{
				wrapper,
			}
		);
		expect( result.current ).toEqual(
			'Discover blahg WordPress Themes on the WordPress.com Showcase. ' +
				'Here you can browse and find the best WordPress designs available on ' +
				'WordPress.com to discover the one that is just right for you.'
		);
	} );

	test( 'should return the generic Theme Showcase description if no additional args are provided', () => {
		const { result } = renderHook( () => useThemeShowcaseDescription(), {
			wrapper,
		} );
		expect( result.current ).toEqual(
			'Beautiful, responsive, free and premium WordPress themes ' +
				'for your photography site, portfolio, magazine, business website, or blog.'
		);
	} );
} );
