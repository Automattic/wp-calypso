/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import ReadmeViewer from 'components/readme-viewer';

ReadmeViewer.prototype.componentDidMount = jest.fn( function () {
	this.setState( {
		readme: 'foo',
	} );
} );

describe( 'ReadmeViewer', () => {
	test( 'should render README.md when given readmeFilePath', () => {
		const readme = shallow( <ReadmeViewer readmeFilePath="foo2" /> );
		expect( readme.hasClass( 'readme-viewer__wrapper' ) ).toBe( true );
	} );

	test( 'should not render a README.md when not given readmeFilePath', () => {
		const readme = shallow( <ReadmeViewer /> );
		expect( readme.hasClass( 'readme-viewer__wrapper' ) ).toBe( false );
	} );

	test( 'should render an edit link by default', () => {
		const readme = shallow( <ReadmeViewer readmeFilePath="foo2" /> );
		expect( readme.find( '.readme-viewer__doc-edit-link' ) ).toHaveLength( 1 );
	} );

	test( 'should not render an edit link when showEditLink is false', () => {
		const readme = shallow( <ReadmeViewer readmeFilePath="foo" showEditLink={ false } /> );
		expect( readme.find( '.readme-viewer__doc-edit-link' ) ).toHaveLength( 0 );
	} );
} );
