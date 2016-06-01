/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow, mount } from 'enzyme';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

/**
 * Helper method to get an html attribute from a ReactWrapper instance.
 * @param {ReactWrapper} reactWrapper An (element) instance of ReactWrapper
 * @param {string} attr The html attribute to retrieve
 * @return {string|null} The attribute value or null if not found of the elem is invalid
 * TODO: when available use chai-enzyme delete this helper
 */
const getAttribute = ( reactWrapper, attr ) => {
	const el = document.createElement( 'div' );
	el.innerHTML = reactWrapper.html();
	const domNode = el.children[0];
	if ( ! domNode || domNode.nodeType !== 1 ) {
		return null;
	}
	return domNode.getAttribute( attr );
};

describe( 'DocsExample', () => {
	const props = {
		title: 'Test Title',
		url: '/test'
	};
	let DocsExample;
	useFakeDom();
	useMockery( mockery => {
		mockery.registerMock( 'components/tooltip', EmptyComponent );
		DocsExample = require( '../index' ).default;
	} );

	it( 'should render', () => {
		const docsExample = shallow(
			<DocsExample { ...props }>
				<EmptyComponent />
			</DocsExample>
		);
		assert.lengthOf( docsExample.find( '.docs-example' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__main' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__link' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__toggle' ), 0 );
		assert.lengthOf( docsExample.find( '.docs-example__stats' ), 0 );

		assert.ok( docsExample.contains( EmptyComponent ) );
	} );

	it( 'should set the correct title/link', () => {
		// TODO: when chai-enzyme is available use `shallow` instead
		const docsExample = mount(
			<DocsExample { ...props }>
				<EmptyComponent />
			</DocsExample>
		);
		const titleLink = docsExample.find( '.docs-example__link' );
		assert.equal( titleLink.text(), props.title );
		// TODO: when available use chai-enzyme instead of this helper
		assert.equal( getAttribute( titleLink, 'href' ), props.url );
	} );

	it( 'should render the toggle button', () => {
		const propsWithToggle = Object.assign(
			{},
			props,
			{
				toggleHandler: noop,
				toggleText: 'My Test Example'
			}
		);
		const docsExample = shallow(
			<DocsExample { ...propsWithToggle }>
				<EmptyComponent />
			</DocsExample>
		);

		assert.lengthOf( docsExample.find( '.docs-example__toggle' ), 1 );
	} );

	it( 'should render the stats', () => {
		const propsWithStats = Object.assign(
			{},
			props,
			{
				componentUsageStats: {
					count: 0
				}
			}
		);
		const docsExample = shallow(
			<DocsExample { ...propsWithStats }>
				<EmptyComponent />
			</DocsExample>
		);

		assert.lengthOf( docsExample.find( '.docs-example__stats' ), 1 );
	} );
} );

describe( 'DocsExampleToggle', () => {
	let Button, DocsExampleToggle;

	useMockery( mockery => {
		mockery.registerMock( 'components/tooltip', EmptyComponent );
		DocsExampleToggle = require( '../index' ).DocsExampleToggle;
		Button = require( 'components/button' );
	} );

	const props = {
		onClick: noop,
		text: 'Toggle me baby!'
	};

	it( 'should render', () => {
		const docsExampleToggle = shallow(
			<DocsExampleToggle { ...props } />
		);

		assert.lengthOf( docsExampleToggle.find( Button ), 1 );
	} );
} );

describe( 'DocsExampleStats', () => {
	let DocsExampleStats;

	useMockery( mockery => {
		mockery.registerMock( 'components/tooltip', EmptyComponent );
		DocsExampleStats = require( '../index' ).DocsExampleStats;
	} );

	const props = {
		count: 10
	};

	it( 'should render', () => {
		const docsExampleStats = shallow(
			<DocsExampleStats { ...props } />
		);

		assert.lengthOf( docsExampleStats.find( '.docs-example-stats' ), 1 );
	} );

	it( 'should have the component\'s usage count', () => {
		const docsExampleStatsCount = shallow(
			<DocsExampleStats { ...props } />
		).find( '.docs-example-stats__count' );

		assert.lengthOf( docsExampleStatsCount, 1 );
		assert.equal( docsExampleStatsCount.text(), props.count );
	} );
} );
