/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Gutenberg from '../gutenberg';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';

describe( 'Gutenberg', () => {
	test( 'should render', () => {
		const wrapper = shallow( <Gutenberg/> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should have a main component', () => {
		const wrapper = shallow( <Gutenberg/> );
		const main = wrapper.find( Main );

		expect( main ).toHaveLength( 1 );
		expect( main.hasClass( 'devdocs devdocs__gutenberg' ) ).toBe( true );
	} );

	test( 'should have a document head component', () => {
		const wrapper = shallow( <Gutenberg/> );
		const documentHead = wrapper.find( DocumentHead );

		expect( documentHead ).toHaveLength( 1 );
		expect( documentHead.props().title ).toBe( 'Gutenberg Blocks' );
	} );

	test( 'should have a readme viewer component', () => {
		const wrapper = shallow( <Gutenberg/> );
		const readmeViewer = wrapper.find( ReadmeViewer );

		expect( readmeViewer ).toHaveLength( 1 );
		expect( readmeViewer.props().readmeFilePath ).toBe( '/client/devdocs/gutenberg/README.md' );
	} );
} );
