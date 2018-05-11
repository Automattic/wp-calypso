/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import ReadmeViewer from 'components/readme-viewer';

describe( 'ReadmeViewer', () => {
	it( 'should render README.md when given readmeFilePath', () => {
		const readme = shallow( <ReadmeViewer readmeFilePath="foo" /> );
		expect( readme ).to.have.className( 'readme-viewer__wrapper' );
	} );

	it( 'should not render a README.md when not given readmeFilePath', () => {
		const readme = shallow( <ReadmeViewer /> );
		expect( readme ).to.not.have.className( 'readme-viewer__wrapper' );
	} );
} );
