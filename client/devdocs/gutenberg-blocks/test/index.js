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
import { registerCoreBlocks } from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import GutenbergBlocks from '../';
import HeaderCake from 'components/header-cake';
import ReadmeViewer from 'components/readme-viewer';
import Collection from 'devdocs/design/search-collection';
import { GutenbergBlockExample } from '../example';
import examplesList from '../examples';

jest.mock( 'page' );
jest.mock( '@wordpress/block-library', () => ( {
	registerCoreBlocks: jest.fn(),
} ) );

describe( 'GutenbergBlocks', () => {
	test( 'should render all the blocks by default', () => {
		const wrapper = shallow( <GutenbergBlocks /> );
		const headerCake = wrapper.find( HeaderCake );
		const readmeViewer = wrapper.find( ReadmeViewer );
		const collection = wrapper.find( Collection );
		const examples = wrapper.find( GutenbergBlockExample );
		expect( wrapper.hasClass( 'is-list' ) ).toBe( true );
		expect( headerCake ).toHaveLength( 0 );
		expect( readmeViewer ).toHaveLength( 1 );
		expect( readmeViewer.props().readmeFilePath ).toBe(
			'/client/devdocs/gutenberg-blocks/README.md'
		);
		expect( collection.children() ).toEqual( examples );
		expect( examples ).toHaveLength( examplesList.length );
		expect( registerCoreBlocks ).toBeCalled();
	} );

	test( 'should render a single block when a component is given', () => {
		const wrapper = shallow( <GutenbergBlocks block="foo" /> );
		const headerCake = wrapper.find( HeaderCake );
		const readmeViewer = wrapper.find( ReadmeViewer );
		expect( wrapper.hasClass( 'is-single' ) ).toBe( true );
		expect( headerCake ).toHaveLength( 1 );
		expect( readmeViewer ).toHaveLength( 0 );
	} );

	test( 'should go back when clicking in HeaderCake', () => {
		const wrapper = shallow( <GutenbergBlocks block="foo" /> );
		const headerCake = wrapper.find( HeaderCake );
		headerCake.simulate( 'click' );
		expect( page ).toBeCalledWith( '/devdocs/gutenberg-blocks/' );
	} );
} );
