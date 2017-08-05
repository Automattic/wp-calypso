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
		const getReadme = sinon.spy();
		const readmeViewer = render( <ReadmeViewer readmeFilePath="foo" getReadme={ getReadme } /> );
		assert.isTrue( getReadme.called );
	} );

	it( 'should not render a README.md when not given readmeFilePath', () => {
		const getReadme = sinon.spy();
		const readmeViewer = render( <ReadmeViewer getReadme={ getReadme } /> );
		assert.isTrue( getReadme.notCalled );
	} );
} );
