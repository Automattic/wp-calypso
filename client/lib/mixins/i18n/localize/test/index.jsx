/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import localize from '../';

describe( '#localize()', () => {
	useFakeDom();

	it( 'should be named using the variable name of the composed component', () => {
		const MyComponent = React.createClass( {
			render: () => null
		} );

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'LocalizedMyComponent' );
	} );

	it( 'should be named using the displayName of the composed component', () => {
		const MyComponent = React.createClass( {
			displayName: 'MyComponent',

			render: () => null
		} );

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'LocalizedMyComponent' );
	} );

	it( 'should be named using the name of the composed function component', () => {
		function MyComponent() {}

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'LocalizedMyComponent' );
	} );

	it( 'should provide translate, moment, and numberFormat props to rendered child', () => {
		const MyComponent = React.createClass( {
			render: () => null
		} );
		const LocalizedComponent = localize( MyComponent );

		const mounted = mount( <LocalizedComponent /> );
		const props = mounted.find( MyComponent ).props();

		expect( props.translate ).to.be.a( 'function' );
		expect( props.moment ).to.be.a( 'function' );
		expect( props.numberFormat ).to.be.a( 'function' );
	} );
} );
