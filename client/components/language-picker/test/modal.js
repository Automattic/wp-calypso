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
import {
	LOCALIZED_LANGUAGE_NAMES_DATA_DE,
	LOCALIZED_LANGUAGE_NAMES_DATA_IT,
} from 'state/i18n/language-names/test/fixture';

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
			{
				langSlug: 'en-gb',
				name: 'English (UK)',
				value: 482,
				wpLocale: 'en_GB',
			},
		],
		selected: 'en',
		translate: identity,
		loadLanguageNames: noop,
		localizedLanguageNames: LOCALIZED_LANGUAGE_NAMES_DATA_DE,
	};

	test( 'should render', () => {
		const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	describe( 'getLocalizedLanguageTitle()', () => {
		test( 'should return slug when no localized language available', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect( wrapper.instance().getLocalizedLanguageTitle( 'oops' ) ).toEqual( 'oops' );
		} );

		test( 'should return localized language', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect( wrapper.instance().getLocalizedLanguageTitle( 'it' ) ).toEqual( 'Italienisch' );
		} );
	} );

	describe( 'getEnglishLanguageTitle()', () => {
		test( 'should return slug when no English language translation available', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect( wrapper.instance().getEnglishLanguageTitle( 'oops' ) ).toEqual( 'oops' );
		} );

		test( 'should return localized language', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect( wrapper.instance().getEnglishLanguageTitle( 'it' ) ).toEqual( 'Italian' );
		} );
	} );

	describe( 'getDisplayedLanguages()', () => {
		test( 'should return results by slug and autonym if localized language names not loaded', () => {
			const props = Object.assign( {}, defaultProps, {
				localizedLanguageNames: {},
			} );
			const wrapper = shallow( <LanguagePickerModal { ...props } /> );
			wrapper.setState( {
				search: 'en', // for [en]glish
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 3 ],
			] );

			wrapper.setState( {
				search: 'english',
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 3 ],
			] );

			wrapper.setState( {
				search: 'inglese', // for [inglese] (English)
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [] );
		} );

		test( 'should return list of popular languages', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );
			wrapper.setState( {
				filter: 'popular',
				search: null,
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 2 ],
			] );
		} );

		test( 'should return list of languages based on search query (with user locale set to Italian)', () => {
			const props = Object.assign( {}, defaultProps, {
				localizedLanguageNames: LOCALIZED_LANGUAGE_NAMES_DATA_IT,
			} );
			const wrapper = shallow( <LanguagePickerModal { ...props } /> );

			wrapper.setState( {
				search: 'en', // for [en]glish
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 3 ],
			] );

			wrapper.setState( {
				search: 'english',
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 3 ],
			] );

			wrapper.setState( {
				search: 'in', // for [in]glese (English)
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 1 ], // Češt[in]a
				defaultProps.languages[ 3 ],
			] );

			wrapper.setState( {
				search: 'cs', // slug for Čeština
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 1 ],
			] );

			wrapper.setState( {
				search: 'ceco', // slug for Čeština
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 1 ],
			] );

			wrapper.setState( {
				search: 'Czech', // en for Čeština
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 1 ],
			] );
		} );

		test( 'should return list of languages based on search query containing accénts', () => {
			const props = Object.assign( {}, defaultProps, {
				localizedLanguageNames: LOCALIZED_LANGUAGE_NAMES_DATA_IT,
			} );
			const wrapper = shallow( <LanguagePickerModal { ...props } /> );

			wrapper.setState( {
				search: 'éñglîsh', // for [en]glish
			} );
			expect( wrapper.instance().getDisplayedLanguages() ).toEqual( [
				defaultProps.languages[ 0 ],
				defaultProps.languages[ 3 ],
			] );
		} );
	} );

	describe( 'suggested languages', () => {
		const browserLanguages = [ 'en-GB', 'en', 'en-US', 'en-AU', 'it' ];
		let _navigator;

		beforeEach( () => {
			_navigator = global.navigator;
			Object.defineProperty( global.navigator, 'languages', {
				get: () => browserLanguages,
				configurable: true,
			} );
		} );

		afterEach( () => {
			global.navigator = _navigator;
		} );

		test( 'should render a list of suggested (WordPress.com-supported) languages', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );
			const suggestedLanguagesTexts = wrapper.find(
				'.language-picker__modal-suggested-list .language-picker__modal-text'
			);

			expect( suggestedLanguagesTexts ).toHaveLength( 3 );
			expect( suggestedLanguagesTexts.at( 0 ).text() ).toEqual( 'English (UK)' );
			expect( suggestedLanguagesTexts.at( 1 ).text() ).toEqual( 'English' );
			expect( suggestedLanguagesTexts.at( 2 ).text() ).toEqual( 'Italiano' );
		} );

		test( 'should not render when there are no suggested languages', () => {
			Object.defineProperty( global.navigator, 'languages', {
				get: () => [],
				configurable: true,
			} );
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			expect(
				wrapper.find( '.language-picker__modal-suggested-list .language-picker__modal-text' )
			).toHaveLength( 0 );
		} );

		test( 'getSuggestedLanguages() should return correct, WordPress.com-supported languages from navigator.languages', () => {
			const wrapper = shallow( <LanguagePickerModal { ...defaultProps } /> );

			[
				{
					navigatorLanguages: [ 'en-US' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 0 ] ],
				},
				// we'll show en-GB because it's a WordPress.com language, and en-US for en-AU because it's a variant of en
				{
					navigatorLanguages: [ 'en-GB', 'en-AU' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 3 ], defaultProps.languages[ 0 ] ],
				},
				{
					navigatorLanguages: [ 'en' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 0 ] ],
				},
				{
					navigatorLanguages: [ 'it' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 2 ] ],
				},
				{
					navigatorLanguages: [ 'it', 'en-US' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 2 ], defaultProps.languages[ 0 ] ],
				},
				{
					navigatorLanguages: [ 'it', 'en' ],
					expectedSuggestedLanguages: [ defaultProps.languages[ 2 ], defaultProps.languages[ 0 ] ],
				},
				{
					navigatorLanguages: [ 'cs', 'it', 'en-US' ],
					expectedSuggestedLanguages: [
						defaultProps.languages[ 1 ],
						defaultProps.languages[ 2 ],
						defaultProps.languages[ 0 ],
					],
				},
			].forEach( item => {
				Object.defineProperty( global.navigator, 'languages', {
					get: () => item.navigatorLanguages,
					configurable: true,
				} );
				expect( wrapper.instance().getSuggestedLanguages() ).toEqual(
					item.expectedSuggestedLanguages
				);
			} );
		} );
	} );
} );
