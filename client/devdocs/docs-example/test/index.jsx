/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow, mount } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import DocsExample, { DocsExampleToggle } from '../index';
import { Button } from '@automattic/components';

describe( 'DocsExample', () => {
	const props = {
		title: 'Test Title',
		url: '/test',
	};
	const childrenFixture = <div id="children">Test</div>;

	test( 'should render', () => {
		// TODO: when chai-enzyme is available use `shallow` instead
		const docsExample = mount( <DocsExample { ...props }>{ childrenFixture }</DocsExample> );
		assert.lengthOf( docsExample.find( '.docs-example' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__main' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__footer' ), 1 );
		assert.ok( docsExample.contains( childrenFixture ) );
		assert.lengthOf( docsExample.find( '.docs-example__toggle' ), 0 );
		assert.lengthOf( docsExample.find( '.docs-example__stats' ), 0 );
	} );

	test( 'should render the toggle button', () => {
		const propsWithToggle = Object.assign( {}, props, {
			toggleHandler: noop,
			toggleText: 'My Test Example',
		} );
		const docsExample = shallow(
			<DocsExample { ...propsWithToggle }>{ childrenFixture }</DocsExample>
		);

		assert.lengthOf( docsExample.find( '.docs-example__toggle' ), 1 );
	} );
} );

describe( 'DocsExampleToggle', () => {
	const props = {
		onClick: noop,
		text: 'Toggle me baby!',
	};

	test( 'should render', () => {
		const docsExampleToggle = shallow( <DocsExampleToggle { ...props } /> );

		assert.lengthOf( docsExampleToggle.find( Button ), 1 );
	} );
} );
