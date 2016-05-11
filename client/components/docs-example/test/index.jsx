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
import DocsExample, { DocsExampleToggle, DocsExampleStats } from '../index';
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
	useFakeDom();

	const props = {
		title: 'Test Title',
		url: '/test'
	};
	const childrenFixture = <div id="children">Test</div>;

	it( 'should render', () => {
		// TODO: when chai-enzyme is available use `shallow` instead
		const docsExample = mount(
			<DocsExample { ...props }>
				{ childrenFixture }
			</DocsExample>
		);
		assert.lengthOf( docsExample.find( '.docs-example' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__main' ), 1 );
		assert.lengthOf( docsExample.find( '.docs-example__footer' ), 1 );
		assert.ok( docsExample.contains( childrenFixture ) );

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
		const docsExample = mount(
			<DocsExample { ...propsWithToggle }>
				{ childrenFixture }
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
		const docsExample = mount(
			<DocsExample { ...propsWithStats }>
				{ childrenFixture }
			</DocsExample>
		);

		assert.lengthOf( docsExample.find( '.docs-example__stats' ), 1 );
	} );
} );

describe( 'DocsExampleToggle', () => {
	useFakeDom();

	const props = {
		onClick: noop,
		text: 'Toggle me baby!'
	};

	it( 'should render', () => {
		const docsExampleToggle = mount(
			<DocsExampleToggle { ...props } />
		);

		const toggleButton = docsExampleToggle.find( '.button' );
		assert.lengthOf( toggleButton, 1 );
		assert.equal( toggleButton.text(), props.text );
	} );
} );

describe( 'DocsExampleStats', () => {
	useFakeDom();

	const props = {
		count: 10
	};

	it( 'should render', () => {
		const docsExampleStats = shallow(
			<DocsExampleStats { ...props } />
		);

		assert.lengthOf( docsExampleStats.find( '.docs-example__stats' ), 1 );
	} );

	it( 'should show the component\'s usage count', () => {
		const docsExampleStats = mount(
			<DocsExampleStats { ...props } />
		);

		const count = docsExampleStats.find( '.count' );
		assert.lengthOf( count, 1 );
		assert.equal( count.text(), props.count );
	} );
} );
