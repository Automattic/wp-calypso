/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { LanguagePickerModal } from '../modal';

describe( 'LanguagePickerModal', () => {
	const defaultProps = {
		onSelected: noop,
		onClose: noop,
		isVisible: true,
		languages: [
			{
				langSlug: 'en',
				name: 'English',
				popular: 1,
				value: 1,
				wpLocale: 'en_US',
			},
			{
				langSlug: 'cs',
				name: 'Čeština',
				value: 11,
				wpLocale: 'cs_CZ',
			},
			{
				langSlug: 'it',
				name: 'Italiano',
				popular: 8,
				value: 35,
				wpLocale: 'it_IT',
			},
		],
		selected: 'en',
		translate: identity,
	};

	test( 'should render', () => {
		const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	describe( 'suggested languages', () => {
		const browserLanguages = [ 'en-AU', 'en', 'en-US', 'it' ];
		let _navigator;

		beforeAll( () => {
			_navigator = global.navigator;
			Object.defineProperty( global.navigator, 'languages', {
				get: () => browserLanguages,
			} );
		} );

		afterAll( () => {
			global.navigator = _navigator;
		} );

		test( 'should return browser languages that appear in WordPress.com supported languages', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect( wrapper.instance().getSuggestedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 2 ],
			] );
		} );

		test( 'should render a list of suggested languages', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );
			const suggestedLanguagesTexts = wrapper.find(
				'.language-picker__modal-suggested-list .language-picker__modal-text'
			);

			expect( suggestedLanguagesTexts ).toHaveLength( 2 );
			expect( suggestedLanguagesTexts.at( 0 ).text() ).toEqual( 'English' );
			expect( suggestedLanguagesTexts.at( 1 ).text() ).toEqual( 'Italiano' );
		} );
	} );
} );
