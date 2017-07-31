/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import React from 'react';
import { render } from 'enzyme';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import ReadmeViewer from 'devdocs/docs-example/readme-viewer';

describe( 'ReadmeViewer', () => {
	it( 'should render README.md when given readmeFilePath', () => {
		const getReadmeHTML = sinon.spy();
		const readmeViewer = render( <ReadmeViewer readmeFilePath="foo" getReadmeHTML={ getReadmeHTML } /> );
		expect( readmeViewer.find( '#docs-example__readme-present-header' ) ).to.have.length(1);
		expect( readmeViewer.find( '#docs-example__readme-not-present-header' ) ).to.have.length(0);
		assert.isTrue( getReadmeHTML.called );
	} );

	it( 'should not render a README.md when not given readmeFilePath', () => {
		const getReadmeHTML = sinon.spy();
		const readmeViewer = render( <ReadmeViewer getReadmeHTML={ getReadmeHTML } /> );
		expect( readmeViewer.find( '#docs-example__readme-present-header' ) ).to.have.length(0);
		expect( readmeViewer.find( '#docs-example__readme-not-present-header' ) ).to.have.length(1);
		assert.isTrue( getReadmeHTML.notCalled );
	} );
} );
