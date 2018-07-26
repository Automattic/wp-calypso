/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { TranslatorInvite } from '../';

describe( 'TranslatorInvite', () => {
	const defaultProps = {
		translate: x => x,
		localizedLanguageNames: {
			'en-gb': {
				localized: 'British English',
				name: 'English (UK)',
				en: 'British English',
			},
			mt: {
				localized: 'Maltese',
				name: 'Malti',
				en: 'Maltese',
			},
			uk: {
				localized: 'Ukrainian',
				name: 'Українська',
				en: 'Ukrainian',
			},
			tl: {
				localized: 'Filipino',
				name: 'Tagalog',
				en: 'Filipino',
			},
		},
	};

	test( 'should not render when no locale information present', () => {
		const wrapper = shallow( <TranslatorInvite { ...defaultProps } /> );
		expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 0 );
	} );

	describe( 'TranslatorInvite with browser locales', () => {
		const browserLanguages = [ 'en-GB', 'en', 'en-US', 'en-AU', 'mt' ];
		beforeEach( () => {
			Object.defineProperty( global.navigator, 'languages', {
				get: () => browserLanguages,
				configurable: true,
			} );
		} );

		test( 'should render', () => {
			const wrapper = shallow( <TranslatorInvite { ...defaultProps } /> );
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
		} );

		test( 'should get non-English locale using browser locales', () => {
			const wrapper = shallow( <TranslatorInvite { ...defaultProps } /> );
			expect( wrapper.instance().getLocale() ).toBe( 'mt' );
		} );

		test( 'should get non-English locale using path prop over browser locale', () => {
			const wrapper = shallow( <TranslatorInvite path="/log-in/uk" { ...defaultProps } /> );
			expect( wrapper.instance().getLocale() ).toBe( 'uk' );
		} );

		test( 'should get non-English locale using locale prop over path and browser locale', () => {
			const wrapper = shallow(
				<TranslatorInvite path="/log-in/uk" locale="tl" { ...defaultProps } />
			);
			expect( wrapper.instance().getLocale() ).toBe( 'tl' );
		} );

		test( 'should get non-English locale using path when locale is defaultish', () => {
			const wrapper = shallow(
				<TranslatorInvite path="/log-in/uk" locale="en-gb" { ...defaultProps } />
			);
			expect( wrapper.instance().getLocale() ).toBe( 'uk' );
		} );

		test( 'should get non-English locale using browser locale when path is a default lang', () => {
			const wrapper = shallow( <TranslatorInvite path="/log-in/en" { ...defaultProps } /> );
			expect( wrapper.instance().getLocale() ).toBe( 'mt' );
		} );
	} );
} );
