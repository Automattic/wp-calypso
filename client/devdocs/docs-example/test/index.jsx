/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import DocsExample, { DocsExampleToggle, DocsExampleStats } from '../index';
import Button from 'components/button';
import Count from 'components/count';

describe( 'DocsExample', () => {
	const props = {
		title: 'Test Title',
		url: '/test',
	};
	const childrenFixture = <div id="children">Test</div>;

	test( 'should render', () => {
		// TODO: when chai-enzyme is available use `shallow` instead
		const docsExample = mount( <DocsExample { ...props }>{ childrenFixture }</DocsExample> );
		expect( docsExample.find( '.docs-example' ).length ).toBe( 1 );
		expect( docsExample.find( '.docs-example__main' ).length ).toBe( 1 );
		expect( docsExample.find( '.docs-example__footer' ).length ).toBe( 1 );
		expect( docsExample.contains( childrenFixture ) ).toBeTruthy();
		expect( docsExample.find( '.docs-example__toggle' ).length ).toBe( 0 );
		expect( docsExample.find( '.docs-example__stats' ).length ).toBe( 0 );
	} );

	test( 'should render the toggle button', () => {
		const propsWithToggle = Object.assign( {}, props, {
			toggleHandler: noop,
			toggleText: 'My Test Example',
		} );
		const docsExample = shallow(
			<DocsExample { ...propsWithToggle }>{ childrenFixture }</DocsExample>
		);

		expect( docsExample.find( '.docs-example__toggle' ).length ).toBe( 1 );
	} );

	test( 'should render the stats', () => {
		const propsWithStats = Object.assign( {}, props, {
			componentUsageStats: {
				count: 0,
			},
		} );
		const docsExample = shallow(
			<DocsExample { ...propsWithStats }>{ childrenFixture }</DocsExample>
		);

		expect( docsExample.find( '.docs-example__stats' ).length ).toBe( 1 );
	} );
} );

describe( 'DocsExampleToggle', () => {
	const props = {
		onClick: noop,
		text: 'Toggle me baby!',
	};

	test( 'should render', () => {
		const docsExampleToggle = shallow( <DocsExampleToggle { ...props } /> );

		expect( docsExampleToggle.find( Button ).length ).toBe( 1 );
	} );
} );

describe( 'DocsExampleStats', () => {
	const props = {
		count: 10,
	};

	test( 'should render', () => {
		const docsExampleStats = shallow( <DocsExampleStats { ...props } /> );

		expect( docsExampleStats.find( 'p' ).length ).toBe( 1 );
	} );

	test( "should have the component's usage count", () => {
		const docsExampleStats = shallow( <DocsExampleStats { ...props } /> );

		expect( docsExampleStats.find( Count ).length ).toBe( 1 );
	} );
} );
