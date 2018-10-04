/** @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { LocaleSuggestions } from '../';

jest.mock( 'lib/i18n-utils', () => ( { addLocaleToPath: locale => locale } ) );
jest.mock( 'i18n-calypso', () => ( { getLocaleSlug: jest.fn( () => '' ) } ) );

jest.mock( 'components/notice', () => props => [ ...props.children ] );

describe( 'LocaleSuggestions', () => {
	const testSuggestions = [
		{ locale: 'es', name: 'Español', availability_text: 'También disponible en' },
		{ locale: 'fr', name: 'Français', availability_text: 'Également disponible en' },
		{ locale: 'en', name: 'English', availability_text: 'Also available in' },
	];

	test( 'should not render without suggestions', () => {
		const wrapper = shallow( <LocaleSuggestions path="" locale="x" /> );
		expect( wrapper.equals( null ) );
	} );

	test( 'should have `locale-suggestions` class', () => {
		const wrapper = shallow(
			<LocaleSuggestions path="" locale="x" localeSuggestions={ testSuggestions } />
		);
		expect( wrapper.contains( '.locale-suggestions' ) );
	} );

	// check that content within a card renders correctly
	test( 'should render suggestions', () => {
		const wrapper = shallow(
			<LocaleSuggestions path="" locale="x" localeSuggestions={ testSuggestions } />
		);
		expect( wrapper.find( 'LocaleSuggestionsListItem' ).length ).toEqual( testSuggestions.length );
	} );

	test( 'should not render children with the same locale', () => {
		getLocaleSlug.mockReturnValue( 'en' );
		const wrapper = shallow(
			<LocaleSuggestions path="" locale="x" localeSuggestions={ testSuggestions } />
		);
		expect( wrapper.find( 'LocaleSuggestionsListItem' ).length ).toEqual(
			testSuggestions.length - 1
		);
	} );

	test( 'should not render "en" when locale is "en-gb"', () => {
		getLocaleSlug.mockReturnValue( 'en-gb' );
		const wrapper = shallow(
			<LocaleSuggestions path="" locale="x" localeSuggestions={ testSuggestions } />
		);
		expect( wrapper.find( 'LocaleSuggestionsListItem' ).length ).toEqual(
			testSuggestions.length - 1
		);
	} );

	test( 'should not render "fr" when locale is "fr-ca"', () => {
		getLocaleSlug.mockReturnValue( 'fr-ca' );
		const wrapper = shallow(
			<LocaleSuggestions path="" locale="x" localeSuggestions={ testSuggestions } />
		);
		expect( wrapper.find( 'LocaleSuggestionsListItem' ).length ).toEqual(
			testSuggestions.length - 1
		);
	} );
} );
