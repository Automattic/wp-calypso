/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { render } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import LanguagePicker from '../';

jest.mock( 'lib/analytics', () => ( {} ) );

const languages = [
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
];

describe( 'LanguagePicker', () => {
	test( 'should render the right icon and label', () => {
		const wrapper = render(
			<LanguagePicker languages={ languages } valueKey="langSlug" value="en" />
		);
		expect( wrapper.find( '.language-picker__icon' ) ).to.have.text( 'en' );
		expect( wrapper.find( '.language-picker__name-label' ) ).to.have.text( 'English' );
	} );
} );
