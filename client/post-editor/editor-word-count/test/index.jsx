/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import { translate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { EditorWordCount } from '../';

describe( 'EditorWordCount', () => {
	test( 'should display word count if selected text is provided', () => {
		const wrapper = mount(
			<EditorWordCount
				rawContent="Selected text"
				selectedText="Selected text"
				translate={ translate }
			/>
		);
		expect( wrapper.text() ).to.equal( '2 words selected / 2 words' );
	} );

	test( 'should not display word count if no selected text is provided', () => {
		const wrapper = mount(
			<EditorWordCount rawContent="Selected text" selectedText={ null } translate={ translate } />
		);
		expect( wrapper.text() ).to.equal( '2 words' );
	} );

	test( 'should display 0 words if no content in post', () => {
		const wrapper = mount(
			<EditorWordCount rawContent="" selectedText={ null } translate={ translate } />
		);
		expect( wrapper.text() ).to.equal( '0 words' );
	} );
} );
