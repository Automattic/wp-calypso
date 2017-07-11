/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/wp', () => ( {
	me: () => ( {
		get: () => {}
	} )
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EditorWordCount } from '../';

describe( 'EditorWordCount', () => {
	it( 'should display word count if selected text is provided', () => {
		const wrapper = mount( <EditorWordCount selectedText={ 'Selected text' } translate={ translate } /> );
		wrapper.setState( { rawContent: 'Selected text' } );
		expect( wrapper.text() ).to.equal( '2 words selected / 2 words' );
	} );

	it( 'should not display word count if no selected text is provided', () => {
		const wrapper = mount( <EditorWordCount selectedText={ null } translate={ translate } /> );
		wrapper.setState( { rawContent: 'Selected text' } );
		expect( wrapper.text() ).to.equal( '2 words' );
	} );

	it( 'should display 0 words if no content in post', () => {
		const wrapper = mount( <EditorWordCount selectedText={ null } translate={ translate } /> );
		wrapper.setState( { rawContent: '' } );
		expect( wrapper.text() ).to.equal( '0 words' );
	} );
} );
