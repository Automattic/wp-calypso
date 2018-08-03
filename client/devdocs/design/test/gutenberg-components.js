/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import page from 'page';

/**
 * Internal dependencies
 */
import GutenbergComponents from '../gutenberg-components';
import HeaderCake from 'components/header-cake';
import ReadmeViewer from 'components/readme-viewer';
import Collection from 'devdocs/design/search-collection';

jest.mock( 'page' );

describe( 'GutenbergComponents', () => {
	test( 'should render all the components by default', () => {
		const wrapper = shallow( <GutenbergComponents /> );
		const headerCake = wrapper.find( HeaderCake );
		const readmeViewer = wrapper.find( ReadmeViewer );
		const collection = wrapper.find( Collection );
		expect( wrapper.hasClass( 'is-list' ) ).toBe( true );
		expect( headerCake ).toHaveLength( 0 );
		expect( readmeViewer ).toHaveLength( 1 );
		expect( readmeViewer.props().readmeFilePath ).toBe(
			'/client/devdocs/gutenberg-components/README.md'
		);
		expect( collection ).toHaveLength( 1 );
		expect( collection.children() ).toHaveLength( 1 );
	} );

	test( 'should render a single component when a component is given', () => {
		const wrapper = shallow( <GutenbergComponents component="foo" /> );
		const headerCake = wrapper.find( HeaderCake );
		const readmeViewer = wrapper.find( ReadmeViewer );
		const collection = wrapper.find( Collection );
		expect( wrapper.hasClass( 'is-single' ) ).toBe( true );
		expect( headerCake ).toHaveLength( 1 );
		expect( readmeViewer ).toHaveLength( 0 );
		expect( collection ).toHaveLength( 1 );
		expect( collection.children() ).toHaveLength( 1 );
	} );

	test( 'should go back when clicking in HeaderCake', () => {
		const wrapper = shallow( <GutenbergComponents component="foo" /> );
		const headerCake = wrapper.find( HeaderCake );
		headerCake.simulate( 'click' );
		expect( page ).toBeCalledWith( '/devdocs/gutenberg-components/' );
	} );
} );
