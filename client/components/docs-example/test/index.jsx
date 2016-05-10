/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import DocsExample from '../index';

const props = {
	title: 'Test',
	url: '/test'
};

const childrenFixture = <div id="children">Test</div>;

describe( 'DocsExample', () => {
	it( 'should render', () => {
		const docsExample = shallow(
			<DocsExample { ...props }>
				{ childrenFixture }
			</DocsExample>
		);
		assert.lengthOf( docsExample.find( '.docs-example' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__link' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__main' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__footer' ), 1 );
		assert.ok( docsExample.contains( childrenFixture ) );
	} );
} );
