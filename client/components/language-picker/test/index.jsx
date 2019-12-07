/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
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
	],
	translate: identity,
	valueKey: 'langSlug',
	value: 'en',
	countryCode: 'FR',
};

describe( 'LanguagePicker', () => {
	test( 'should render the right icon and label', () => {
		const wrapper = shallow( <LanguagePicker { ...defaultProps } /> );
		expect( wrapper.find( '.language-picker__icon' ).text() ).toBe( 'en' );
		expect( wrapper.find( '.language-picker__name-label' ).text() ).toBe( 'English' );
	} );
	test( 'should render the right icon and label for a language variant', () => {
		const newProps = { ...defaultProps, value: 'de_formal' };
		const wrapper = shallow( <LanguagePicker { ...newProps } /> );
		expect( wrapper.find( '.language-picker__icon' ).text() ).toBe( 'de' );
		expect( wrapper.find( '.language-picker__name-label' ).text() ).toBe( 'Deutsch (Sie)' );
	} );
	test( 'should render the right icon and label for a language variant with regional subcode', () => {
		const newProps = { ...defaultProps, value: 'es-mx_gringos' };
		const wrapper = shallow( <LanguagePicker { ...newProps } /> );
		expect( wrapper.find( '.language-picker__icon-inner' ).html() ).toBe(
			'<div class="language-picker__icon-inner">es<br/>mx</div>'
		);
		expect( wrapper.find( '.language-picker__name-label' ).text() ).toBe(
			'Español de México de los Gringos'
		);
	} );
} );
