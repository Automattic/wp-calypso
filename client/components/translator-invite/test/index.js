/**
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
		translate: ( x ) => x,
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

	test( 'should render when no locale information present', () => {
		const wrapper = shallow( <TranslatorInvite { ...defaultProps } locale="tl" /> );
		expect( wrapper.find( '.translator-invite__content' ) ).toHaveLength( 1 );
	} );
} );
