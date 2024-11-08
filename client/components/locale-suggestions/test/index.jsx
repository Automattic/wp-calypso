/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { getLocaleSlug } from 'i18n-calypso';
import { LocaleSuggestions } from '../';

jest.mock( 'i18n-calypso', () => ( {
	getLocaleSlug: jest.fn( () => '' ),
	localize: jest.fn( ( component ) => component ),
	translate: jest.fn( ( text ) => text ),
} ) );
jest.mock( 'calypso/components/notice', () => ( { children } ) => <>{ children }</> );

describe( 'LocaleSuggestions', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	const defaultProps = {
		path: '',
		locale: 'x',
		localeSuggestions: [
			{ locale: 'es', name: 'Español', availability_text: 'También disponible en' },
			{ locale: 'fr', name: 'Français', availability_text: 'Également disponible en' },
			{ locale: 'en', name: 'English', availability_text: 'Also available in' },
		],
		setLocale: jest.fn(),
	};

	test( 'should not render without suggestions', () => {
		render( <LocaleSuggestions path="" locale="x" setLocale={ () => {} } /> );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	// check that content within a card renders correctly
	test( 'should render suggestions with language name and language code in path', () => {
		render( <LocaleSuggestions { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'English' } ) ).toBeVisible();

		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toHaveAttribute( 'href', '/es' );
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toHaveAttribute( 'href', '/fr' );
		expect( screen.getByRole( 'link', { name: 'English' } ) ).toHaveAttribute( 'href', '/en' );
	} );

	test( 'should not render children with the same locale', () => {
		getLocaleSlug.mockReturnValue( 'en' );
		render( <LocaleSuggestions { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'English' } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "en" when locale is "en-gb"', () => {
		getLocaleSlug.mockReturnValue( 'en-gb' );
		render( <LocaleSuggestions { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Français' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'English' } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "fr" when locale is "fr-ca"', () => {
		getLocaleSlug.mockReturnValue( 'fr-ca' );
		render( <LocaleSuggestions { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: 'Español' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'English' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Français' } ) ).not.toBeInTheDocument();
	} );

	test( 'should set the locale if it changes', () => {
		const { rerender } = render( <LocaleSuggestions { ...defaultProps } /> );
		rerender( <LocaleSuggestions { ...defaultProps } locale="x" /> );
		expect( defaultProps.setLocale ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.setLocale ).toHaveBeenCalledWith( 'x' );
	} );
} );
