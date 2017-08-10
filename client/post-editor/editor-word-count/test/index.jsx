/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'EditorWordCount', () => {
	let EditorWordCount;

	useFakeDom();
	useMockery();

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop,
			} ),
		} );
	} );

	before( function() {
		EditorWordCount = require( '../' ).EditorWordCount;
	} );

	it( 'should display word count if selected text is provided', () => {
		const wrapper = mount(
			<EditorWordCount selectedText={ 'Selected text' } translate={ translate } />
		);
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
