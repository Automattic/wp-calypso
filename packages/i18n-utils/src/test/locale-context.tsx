/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { LocaleProvider, useLocale, withLocale } from '../locale-context';

describe( 'useLocale', () => {
	it( 'returns "en" if there is no LocaleProvider', () => {
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
