/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import SingleDocClass from '../doc';

jest.mock( 'calypso/devdocs/service', () => ( {
	fetch: () => {},
} ) );

const defaultProps = {
	term: 'hello',
	path: '/example',
	sectionId: '',
};

describe( 'SingleDoc', () => {
	describe( 'render test', () => {
		test( 'should render html with marked text', () => {
			const wrapper = shallow( <SingleDocClass { ...defaultProps } /> );
			wrapper.setState( { body: '<div><p>something hello</p></div>' } );
			expect( wrapper.find( '.devdocs__body .devdocs__doc-content' ).html() ).toEqual(
				'<div class="devdocs__doc-content"><div><p>something <mark>hello</mark></p></div></div>'
			);
			expect( wrapper.find( 'Error' ) ).toHaveLength( 0 );
		} );

		test( 'should render Error component', () => {
			const wrapper = shallow( <SingleDocClass { ...defaultProps } /> );
			wrapper.setState( {
				error: 'Error invoking /devdocs/content: File does not exist" is displayed',
			} );
			expect( wrapper.find( 'Error' ) ).toHaveLength( 1 );
			expect( wrapper.find( '.devdocs__body' ) ).toHaveLength( 0 );
		} );
	} );
} );
