/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { setLocale } from 'calypso/state/ui/language/actions';
import LocaleSuggestions from '../';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn( () => Object.assign( jest.fn(), { localeSlug: 'x' } ) ),
} ) );
jest.mock( 'calypso/components/notice', () => ( { children } ) => <>{ children }</> );
jest.mock( 'calypso/state/ui/language/actions', () => ( {
	setLocale: jest.fn( () => ( { type: '' } ) ),
} ) );

const mockStore = configureStore();

describe( 'LocaleSuggestions', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	const localeSuggestions = {
		locales: [
			{ locale: 'es', name: 'Español' },
			{ locale: 'fr', name: 'Français' },
			{ locale: 'en', name: 'English' },
		],
		availability_text_templates: {
			1: 'Also available in %s',
			2: 'Also available in %1$s and %2$s',
			3: 'Also available in %1$s, %2$s and %3$s',
		},
	};

	const defaultStore = mockStore( { i18n: { localeSuggestions } } );

	const defaultProps = {
		path: '',
		locale: 'en',
	};

	test( 'should not render without suggestions', () => {
		const store = mockStore( { i18n: { localeSuggestions: null } } );
		render(
			<Provider store={ store }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'should render suggestions with language name and language code in path', () => {
		render(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		localeSuggestions.locales.forEach( ( { locale, name } ) => {
			expect( screen.getByRole( 'link', { name } ) ).toHaveAttribute( 'href', `/${ locale }` );
		} );
	} );

	test( 'should render correctly with two suggestions', () => {
		const store = mockStore( {
			i18n: {
				localeSuggestions: {
					...localeSuggestions,
					locales: localeSuggestions.locales.slice( 0, 2 ),
				},
			},
		} );
		render(
			<Provider store={ store }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		expect(
			screen.getByRole( 'link', { name: localeSuggestions.locales[ 0 ].name } )
		).toBeVisible();
		expect(
			screen.getByRole( 'link', { name: localeSuggestions.locales[ 1 ].name } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: localeSuggestions.locales[ 2 ].name } )
		).not.toBeInTheDocument();
	} );

	test( 'should render correctly with one suggestions', () => {
		const store = mockStore( {
			i18n: {
				localeSuggestions: {
					...localeSuggestions,
					locales: localeSuggestions.locales.slice( 0, 1 ),
				},
			},
		} );
		render(
			<Provider store={ store }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		expect(
			screen.getByRole( 'link', { name: localeSuggestions.locales[ 0 ].name } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: localeSuggestions.locales[ 1 ].name } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'link', { name: localeSuggestions.locales[ 2 ].name } )
		).not.toBeInTheDocument();
	} );

	test( 'should not render suggestion for the current locale', () => {
		useTranslate.mockImplementation( () => Object.assign( jest.fn(), { localeSlug: 'en' } ) );

		render(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'English' } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "en" when locale is "en-gb"', () => {
		useTranslate.mockImplementation( () => Object.assign( jest.fn(), { localeSlug: 'en-gb' } ) );

		render(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'English' } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "fr" when locale is "fr-ca"', () => {
		useTranslate.mockImplementation( () => Object.assign( jest.fn(), { localeSlug: 'fr-ca' } ) );

		render(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'English' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Français' } ) ).not.toBeInTheDocument();
	} );

	test( 'should set the locale if it changes', () => {
		const { rerender } = render(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } />
			</Provider>
		);
		rerender(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } locale="en" />
			</Provider>
		);

		expect( setLocale ).toHaveBeenCalledTimes( 1 );
		expect( setLocale ).toHaveBeenCalledWith( 'en' );

		rerender(
			<Provider store={ defaultStore }>
				<LocaleSuggestions { ...defaultProps } locale="fr" />
			</Provider>
		);

		expect( setLocale ).toHaveBeenCalledTimes( 2 );
		expect( setLocale ).toHaveBeenCalledWith( 'fr' );
	} );
} );
