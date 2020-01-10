/**
 * External dependencies
 */
import { shallow } from 'enzyme';
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
		const docsExample = shallow( <DocsExample { ...props }>{ childrenFixture }</DocsExample> );
		expect( docsExample.find( '.docs-example' ) ).toHaveLength( 1 );
		expect( docsExample.find( '.docs-example__main' ) ).toHaveLength( 1 );
		expect( docsExample.contains( childrenFixture ) ).toBe( true );
		expect( docsExample.find( '.docs-example__toggle' ) ).toHaveLength( 0 );
	} );

	test( 'should render the toggle button', () => {
		const propsWithToggle = { ...props, toggleHandler: noop, toggleText: 'My Test Example' };
		const docsExample = shallow(
			<DocsExample { ...propsWithToggle }>{ childrenFixture }</DocsExample>
		);

		expect( docsExample.find( '.docs-example__toggle' ) ).toHaveLength( 1 );
	} );
} );

describe( 'DocsExampleToggle', () => {
	const props = {
		onClick: noop,
		text: 'Toggle me baby!',
	};

	test( 'should render', () => {
		const docsExampleToggle = shallow( <DocsExampleToggle { ...props } /> );

		expect( docsExampleToggle.find( Button ) ).toHaveLength( 1 );
	} );
} );
