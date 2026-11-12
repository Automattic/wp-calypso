// @vitest-environment jsdom
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { getLocaleData, subscribe } from '@wordpress/i18n';
import { type Mock, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { LocaleProvider, useLocale, withLocale } from '../locale-context';

vi.mock( '@wordpress/i18n', () => ( {
	getLocaleData: vi.fn(),
	subscribe: vi.fn(),
} ) );

beforeEach( () => {
	vi.mocked( getLocaleData ).mockReset();
	vi.mocked( subscribe ).mockReset();
} );

describe( 'useLocale', () => {
	it( 'returns "en" if there is no LocaleProvider or @wordpress/i18n data', () => {
		const { result } = renderHook( () => useLocale() );

		expect( result.current ).toBe( 'en' );
	} );

	it( 'returns the slug supplied to LocaleProvider', () => {
		const { result } = renderHook( () => useLocale(), {
			wrapper: ( props ) => <LocaleProvider localeSlug="ja" { ...props } />,
		} );

		expect( result.current ).toBe( 'ja' );
	} );

	it( 'returns the new locale when it changes', () => {
		const { result, rerender } = renderHook( () => useLocale(), {
			wrapper: ( props ) => <LocaleProvider localeSlug="en" { ...props } />,
		} );

		rerender( { localeSlug: 'ar' } );

		waitFor( () => expect( result.current ).toBe( 'ar' ) );
	} );

	it( "uses locale data from @wordpress/i18n if <LocaleProvider> isn't present", () => {
		vi.mocked( getLocaleData ).mockImplementation( () => ( {
			'': { language: 'ar' },
		} ) );

		const { result } = renderHook( () => useLocale() );

		expect( result.current ).toBe( 'ar' );
	} );

	it( 'prefers <LocaleProvider> if both are present', () => {
		vi.mocked( getLocaleData ).mockImplementation( () => ( {
			'': { language: 'he' },
		} ) );

		const { result } = renderHook( () => useLocale(), {
			wrapper: ( props ) => <LocaleProvider localeSlug="es" { ...props } />,
		} );

		expect( result.current ).toBe( 'es' );
	} );

	it( 'subscribes to changes to @wordpress/i18n data', () => {
		vi.mocked( getLocaleData ).mockImplementation( () => ( {
			'': { language: 'es' },
		} ) );

		let subscribeCallback;
		( subscribe as Mock ).mockImplementation( ( callback ) => {
			subscribeCallback = callback;
		} );

		const { result } = renderHook( () => useLocale() );

		expect( subscribe ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( result.current ).toBe( 'es' );

		vi.mocked( getLocaleData ).mockImplementation( () => ( {
			'': { language: 'ja' },
		} ) );
		act( () => subscribeCallback() );

		expect( result.current ).toBe( 'ja' );
	} );

	it( 'unsubscribes from @wordpress/i18n when <LocaleProvider> starts to provide a value', async () => {
		vi.mocked( getLocaleData ).mockImplementation( () => ( {
			'': { language: 'es' },
		} ) );

		const unsubscribe = vi.fn();
		vi.mocked( subscribe ).mockImplementation( () => {
			return unsubscribe();
		} );

		const { result, rerender } = renderHook( () => useLocale(), {
			wrapper: ( props ) => <LocaleProvider localeSlug={ undefined } { ...props } />,
		} );

		expect( result.current ).toBe( 'es' );

		rerender( { localeSlug: 'ar' } );

		expect( unsubscribe ).toHaveBeenCalled();
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
