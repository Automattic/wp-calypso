/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import { getLocaleData, subscribe } from '@wordpress/i18n';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { LocaleProvider, useLocale, withLocale } from '../locale-context';

jest.mock( '@wordpress/i18n', () => ( {
	getLocaleData: jest.fn( () => ( {} ) ),
	subscribe: jest.fn( () => () => undefined ),
} ) );

beforeEach( () => {
	( getLocaleData as jest.Mock ).mockReset();
	( subscribe as jest.Mock ).mockReset();
} );

describe( 'useLocale', () => {
	it( 'returns "en" if there is no LocaleProvider or @wordpress/i18n data', () => {
		const { result } = renderHook( () => useLocale() );

		expect( result.current ).toBe( 'en' );
	} );

	it( 'returns the slug supplied to LocaleProvider', () => {
		const { result } = renderHook( () => useLocale(), {
			wrapper: LocaleProvider,
			initialProps: { localeSlug: 'ja' },
		} );

		expect( result.current ).toBe( 'ja' );
	} );

	it( 'returns the new locale when it changes', () => {
		const { result, rerender } = renderHook( () => useLocale(), {
			wrapper: LocaleProvider,
			initialProps: { localeSlug: 'en' },
		} );

		rerender( { localeSlug: 'ar' } );

		expect( result.current ).toBe( 'ar' );
	} );

	it( "uses locale data from @wordpress/i18n if <LocaleProvider> isn't present", () => {
		( getLocaleData as jest.Mock ).mockImplementation( () => ( {
			'': { language: 'ar' },
		} ) );

		const { result } = renderHook( () => useLocale() );

		expect( result.current ).toBe( 'ar' );
	} );

	it( 'prefers <LocaleProvider> if both are present', () => {
		( getLocaleData as jest.Mock ).mockImplementation( () => ( {
			'': { language: 'he' },
		} ) );

		const { result } = renderHook( () => useLocale(), {
			wrapper: LocaleProvider,
			initialProps: { localeSlug: 'es' },
		} );

		expect( result.current ).toBe( 'es' );
	} );

	it( 'subscribes to changes to @wordpress/i18n data', () => {
		( getLocaleData as jest.Mock ).mockImplementation( () => ( {
			'': { language: 'es' },
		} ) );

		let subscribeCallback;
		( subscribe as jest.Mock ).mockImplementation( ( callback ) => {
			subscribeCallback = callback;
		} );

		const { result } = renderHook( () => useLocale() );

		expect( subscribe ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( result.current ).toBe( 'es' );

		( getLocaleData as jest.Mock ).mockImplementation( () => ( {
			'': { language: 'ja' },
		} ) );
		act( () => subscribeCallback() );

		expect( result.current ).toBe( 'ja' );
	} );

	it( 'unsubscribes from @wordpress/i18n when <LocaleProvider> starts to provide a value', () => {
		( getLocaleData as jest.Mock ).mockImplementation( () => ( {
			'': { language: 'es' },
		} ) );

		const unsubscribe = jest.fn();
		( subscribe as jest.Mock ).mockImplementation( () => unsubscribe );

		const { result, rerender } = renderHook( () => useLocale(), {
			wrapper: LocaleProvider,
			initialProps: { localeSlug: undefined },
		} );

		expect( result.current ).toBe( 'es' );

		rerender( { localeSlug: 'ar' } );

		expect( unsubscribe ).toHaveBeenCalled();
		expect( result.current ).toBe( 'ar' );
	} );
} );

describe( 'withLocale', () => {
	const TestComponent = withLocale( ( { locale } ) => <div>current locale is: { locale }</div> );

	it( 'returns "en" if there is no LocaleProvider', () => {
		const { getByText } = render( <TestComponent /> );

		expect( getByText( 'current locale is: en' ) ).toBeInTheDocument();
	} );

	it( 'returns the slug supplied to LocaleProvider', () => {
		const { getByText } = render(
			<LocaleProvider localeSlug="ja">
				<TestComponent />
			</LocaleProvider>
		);

		expect( getByText( 'current locale is: ja' ) ).toBeInTheDocument();
	} );

	it( 'returns the new locale when it changes', () => {
		const { getByText, rerender } = render(
			<LocaleProvider localeSlug="en">
				<TestComponent />
			</LocaleProvider>
		);

		rerender(
			<LocaleProvider localeSlug="ar">
				<TestComponent />
			</LocaleProvider>
		);

		expect( getByText( 'current locale is: ar' ) ).toBeInTheDocument();
	} );
} );
