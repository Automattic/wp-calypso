/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { LanguagePicker } from '../';

jest.mock( 'lib/analytics', () => ( {} ) );

const defaultProps = {
	translate: identity,
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
	],
	valueKey: 'langSlug',
	value: 'en',
};

describe( 'LanguagePicker', () => {
	test( 'should render the right icon and label', () => {
		const wrapper = shallow( <LanguagePicker { ...defaultProps } /> );
		expect( wrapper.find( '.language-picker__icon' ) ).to.have.text( 'en' );
		expect( wrapper.find( '.language-picker__name-label' ) ).to.have.text( 'English' );
	} );
} );
