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
		translate: jest.fn(),
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
		let _navigator;
		const browserLanguages = [ 'en-GB', 'en', 'en-US', 'en-AU', 'mt' ];
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

		test( 'should render using browser locales', () => {
			const wrapper = shallow( <TranslatorInvite { ...defaultProps } /> );
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
			expect( defaultProps.translate.mock.calls[ 0 ][ 1 ].args.defaultLanguage ).toBe( 'Maltese' );
		} );

		test( 'should render using path prop over browser locale', () => {
			const wrapper = shallow( <TranslatorInvite path="/log-in/uk" { ...defaultProps } /> );
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
			expect( defaultProps.translate.mock.calls[ 1 ][ 1 ].args.defaultLanguage ).toBe(
				'Ukrainian'
			);
		} );

		test( 'should render using locale prop over path and browser locale', () => {
			const wrapper = shallow(
				<TranslatorInvite path="/log-in/uk" locale="tl" { ...defaultProps } />
			);
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
			expect( defaultProps.translate.mock.calls[ 2 ][ 1 ].args.defaultLanguage ).toBe( 'Filipino' );
		} );

		test( 'should render using path when locale is defaultish', () => {
			const wrapper = shallow(
				<TranslatorInvite path="/log-in/uk" locale="en-gb" { ...defaultProps } />
			);
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
			expect( defaultProps.translate.mock.calls[ 3 ][ 1 ].args.defaultLanguage ).toBe(
				'Ukrainian'
			);
		} );

		test( 'should render using path when pth is default', () => {
			const wrapper = shallow( <TranslatorInvite path="/log-in/en" { ...defaultProps } /> );
			expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
			expect( defaultProps.translate.mock.calls[ 4 ][ 1 ].args.defaultLanguage ).toBe( 'Maltese' );
		} );
	} );
} );
