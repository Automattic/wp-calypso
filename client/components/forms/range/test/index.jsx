/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["TestUtils.*"] }] */

import { Gridicon } from '@automattic/components';
import ReactDom from 'react-dom';
import TestUtils from 'react-dom/test-utils';
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

		expect( content ).toHaveLength( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).toEqual( expect.stringContaining( 'is-min' ) );
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

		expect( content ).toHaveLength( 1 );
		expect( content[ 0 ].getAttribute( 'class' ) ).toEqual( expect.stringContaining( 'is-max' ) );
	} );

	test( 'should render a value label if passed a truthy `showValueLabel` prop', () => {
		const range = TestUtils.renderIntoDocument( <FormRange value={ 8 } showValueLabel readOnly /> );
		const label = TestUtils.findRenderedDOMComponentWithClass( range, 'range__label' );

		expect( label.textContent ).toEqual( '8' );
	} );
} );
