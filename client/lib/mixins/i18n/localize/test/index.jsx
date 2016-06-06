/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import localize from '../';

describe( '#localize()', () => {
	it( 'should be named using the variable name of the composed component', () => {
		const MyComponent = React.createClass( {
			render: () => null
		} );

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'LocalizedMyComponent' );
	} );

	it( 'should be named using the displayName of the composed component', () => {
		const MyComponent = React.createClass( {
			displayName: 'MyRenamedComponent',

			render: () => null
		} );

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'LocalizedMyRenamedComponent' );
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

		const mounted = shallow( <LocalizedComponent /> );
		const props = mounted.find( MyComponent ).props();

		expect( props.translate ).to.be.a( 'function' );
		expect( props.moment ).to.be.a( 'function' );
		expect( props.numberFormat ).to.be.a( 'function' );
	} );
} );
