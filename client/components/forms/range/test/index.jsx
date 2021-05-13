/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["TestUtils.*"] }] */

/**
 * External dependencies
 */
import { expect } from 'chai';
import Gridicon from 'calypso/components/gridicon';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import FormRange from '../';

describe( 'index', () => {
	afterEach( () => {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	test( 'should render beginning content if passed a `minContent` prop', () => {
		const range = TestUtils.renderIntoDocument(
			<FormRange minContent={ <Gridicon icon="minus-small" /> } />
		);
		TestUtils.findRenderedDOMComponentWithClass( range, 'gridicons-minus-small' );
	} );

	test( 'should not render ending content if not passed a `maxContent` prop', () => {
		const range = TestUtils.renderIntoDocument(
			<FormRange minContent={ <Gridicon icon="minus-small" /> } />
		);
		const content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).to.contain( 'is-min' );
	} );

	test( 'should render ending content if passed a `maxContent` prop', () => {
		const range = TestUtils.renderIntoDocument(
			<FormRange maxContent={ <Gridicon icon="plus-small" /> } />
		);
		TestUtils.findRenderedDOMComponentWithClass( range, 'gridicons-plus-small' );
	} );

	test( 'should not render beginning content if not passed a `minContent` prop', () => {
		const range = TestUtils.renderIntoDocument(
			<FormRange maxContent={ <Gridicon icon="plus-small" /> } />
		);
		const content = TestUtils.scryRenderedDOMComponentsWithClass( range, 'range__content' );

		expect( content ).to.have.length( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).to.contain( 'is-max' );
	} );

	test( 'should render a value label if passed a truthy `showValueLabel` prop', () => {
		const range = TestUtils.renderIntoDocument(
			<FormRange value={ 8 } showValueLabel={ true } readOnly={ true } />
		);
		const label = TestUtils.findRenderedDOMComponentWithClass( range, 'range__label' );

		expect( label.textContent ).to.equal( '8' );
	} );
} );
