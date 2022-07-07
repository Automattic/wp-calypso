/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { LanguagePicker } from '../';

const defaultProps = {
	languages: [
		{
			value: 1,
			langSlug: 'en',
			name: 'English',
			wpLocale: 'en_US',
			popular: 1,
		},
		{
			value: 11,
			langSlug: 'cs',
			name: 'Čeština',
			wpLocale: 'cs_CZ',
		},
		{
			value: 900,
			langSlug: 'de_formal',
			name: 'Deutsch (Sie)',
			wpLocale: 'de_DE_formal',
		},
		{
			value: 902,
			langSlug: 'es-mx_gringos',
			name: 'Español de México de los Gringos',
			wpLocale: 'es_MX_gringos',
		},
		{
			value: 111,
			langSlug: 'ko',
			name: '한국어',
			wpLocale: 'ko_KR',
		},
	],
	translate: ( string ) => string,
	valueKey: 'langSlug',
	value: 'en',
	countryCode: 'FR',
};

describe( 'LanguagePicker', () => {
	test( 'should render the right icon and label', () => {
		render( <LanguagePicker { ...defaultProps } /> );
		expect( screen.getByText( 'en' ).parentNode ).toHaveClass( 'language-picker__icon' );
		expect( screen.getByText( 'English' ) ).toHaveClass( 'language-picker__name-label' );
	} );
	test( 'should render the right icon and label for a language variant', () => {
		const newProps = { ...defaultProps, value: 'de_formal' };
		render( <LanguagePicker { ...newProps } /> );
		expect( screen.getByText( 'de' ).parentNode ).toHaveClass( 'language-picker__icon' );
		expect( screen.getByText( 'Deutsch (Sie)' ) ).toHaveClass( 'language-picker__name-label' );
	} );
	test( 'should render the right icon and label for a language variant with regional subcode', () => {
		const newProps = { ...defaultProps, value: 'es-mx_gringos' };
		render( <LanguagePicker { ...newProps } /> );
		expect( screen.getByText( 'es mx' ).parentNode ).toHaveClass( 'language-picker__icon' );
		expect( screen.getByText( 'Español de México de los Gringos' ) ).toHaveClass(
			'language-picker__name-label'
		);
	} );
	test( 'ensure non utf language names display in localized character sets', () => {
		const newProps = { ...defaultProps, value: 'ko' };
		render( <LanguagePicker { ...newProps } /> );
		expect( screen.getByText( '한국어' ) ).toHaveClass( 'language-picker__name-label' );
	} );
} );
