/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { getLocaleSlug } from 'i18n-calypso';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LocaleSuggestions from '../';

jest.mock( 'calypso/state/selectors/get-locale-suggestions' );
jest.mock( 'calypso/state/ui/language/actions', () => ( {
	setLocale: ( locale ) => ( {
		type: 'SET_LOCALE',
		locale,
	} ),
} ) );

jest.mock( 'react-redux', () => {
	const mockDispatch = jest.fn();
	return {
		...jest.requireActual( 'react-redux' ),
		useSelector: jest.fn(),
		useDispatch: () => mockDispatch,
	};
} );

jest.mock( '@wordpress/element', () => {
	const mockCreateInterpolateElement = ( text, elements ) => {
		if ( text.includes( 'Also available in' ) ) {
			if ( text.includes( 'and' ) ) {
				// Multiple languages
				return Object.entries( elements ).map( ( [ key, element ] ) => {
					const match = text.match( new RegExp( `<${ key }>(.*?)</${ key }>` ) );
					if ( match ) {
						return {
							...element,
							props: {
								...element.props,
								children: match[ 1 ],
							},
						};
					}
					return element;
				} );
			}
			// Single language
			const match = text.match( /<link>(.*?)<\/link>/ );
			if ( match ) {
				return {
					...elements.link,
					props: {
						...elements.link.props,
						children: match[ 1 ],
					},
				};
			}
			return elements.link;
		}
		return text;
	};

	return {
		...jest.requireActual( '@wordpress/element' ),
		createInterpolateElement: mockCreateInterpolateElement,
	};
} );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	getLocaleSlug: jest.fn( () => '' ),
	useTranslate: () => ( text, options ) => {
		if ( options?.args ) {
			if ( text.includes( 'Also available in' ) ) {
				if ( text.includes( 'and' ) ) {
					// Multiple languages
					return `Also available in <link0>${ options.args.allButLastLanguage }</link0> and <link1>${ options.args.lastLanguage }</link1>`;
				}
				// Single language
				return `Also available in <link>${ options.args.language }</link>`;
			}
		}
		return text;
	},
} ) );

jest.mock( 'calypso/components/notice', () => ( { children } ) => <>{ children }</> );
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const defaultProps = {
	path: '',
	locale: 'x',
	setLocale: jest.fn(),
};

describe( 'LocaleSuggestions', () => {
	let mockDispatch;

	beforeEach( () => {
		getLocaleSuggestions.mockReset();
		useSelector.mockImplementation( () => getLocaleSuggestions() );
		mockDispatch = useDispatch();
		mockDispatch.mockImplementation( ( action ) => {
			if ( action.type === 'SET_LOCALE' ) {
				defaultProps.setLocale( action.locale );
			}
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const defaultSuggestions = [
		{ locale: 'es', name: 'Español', availability_text: 'También disponible en' },
		{ locale: 'fr', name: 'Français', availability_text: 'Également disponible en' },
		{ locale: 'en', name: 'English', availability_text: 'Also available in' },
	];

	test( 'should not render without suggestions', () => {
		getLocaleSuggestions.mockReturnValue( null );
		renderWithProvider( <LocaleSuggestions path="" locale="x" setLocale={ () => {} } />, {
			reducers: { ui: ( state = {} ) => state },
		} );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'should render suggestions with language name and language code in path', () => {
		getLocaleSuggestions.mockReturnValue( defaultSuggestions );
		renderWithProvider( <LocaleSuggestions { ...defaultProps } />, {
			reducers: { ui: ( state = {} ) => state },
		} );
		expect( screen.getByRole( 'link', { name: /Español/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Français/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /English/ } ) ).toBeVisible();

		expect( screen.getByRole( 'link', { name: /Español/ } ) ).toHaveAttribute( 'href', '/es' );
		expect( screen.getByRole( 'link', { name: /Français/ } ) ).toHaveAttribute( 'href', '/fr' );
		expect( screen.getByRole( 'link', { name: /English/ } ) ).toHaveAttribute( 'href', '/en' );
	} );

	test( 'should not render children with the same locale', () => {
		getLocaleSuggestions.mockReturnValue( defaultSuggestions );
		getLocaleSlug.mockReturnValue( 'en' );
		renderWithProvider( <LocaleSuggestions { ...defaultProps } />, {
			reducers: { ui: ( state = {} ) => state },
		} );
		expect( screen.getByRole( 'link', { name: /Español/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Français/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /English/ } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "en" when locale is "en-gb"', () => {
		getLocaleSuggestions.mockReturnValue( defaultSuggestions );
		getLocaleSlug.mockReturnValue( 'en-gb' );
		renderWithProvider( <LocaleSuggestions { ...defaultProps } />, {
			reducers: { ui: ( state = {} ) => state },
		} );
		expect( screen.getByRole( 'link', { name: /Español/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Français/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /English/ } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render "fr" when locale is "fr-ca"', () => {
		getLocaleSuggestions.mockReturnValue( defaultSuggestions );
		getLocaleSlug.mockReturnValue( 'fr-ca' );
		renderWithProvider( <LocaleSuggestions { ...defaultProps } />, {
			reducers: { ui: ( state = {} ) => state },
		} );
		expect( screen.getByRole( 'link', { name: /Español/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /English/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /Français/ } ) ).not.toBeInTheDocument();
	} );

	test( 'should set the locale if it changes', () => {
		getLocaleSuggestions.mockReturnValue( defaultSuggestions );
		const { rerender } = renderWithProvider(
			<LocaleSuggestions { ...defaultProps } locale="en" />,
			{
				reducers: { ui: ( state = {} ) => state },
			}
		);
		defaultProps.setLocale.mockClear();
		rerender( <LocaleSuggestions { ...defaultProps } locale="x" /> );
		expect( defaultProps.setLocale ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.setLocale ).toHaveBeenCalledWith( 'x' );
	} );
} );
