import { expect } from 'chai';
import TestUtils from 'react-addons-test-utils' ;
import useMockery from 'test/helpers/use-mockery' ;

import React from 'react';
import ReactDOM from 'react-dom';

import sinon from 'sinon';

import identity from 'lodash/identity';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( '#signupStep User', () => {
	let User, testElement, rendered, EMPTY_COMPONENT;

	useFakeDom();

	useMockery( ( mockery ) => {
		EMPTY_COMPONENT = require( 'test/helpers/react/empty-component' );

		mockery.registerMock( 'lib/analytics', {} );
		mockery.registerMock( 'components/signup-form', EMPTY_COMPONENT );
		mockery.registerMock( 'signup/step-wrapper', EMPTY_COMPONENT );

		mockery.registerMock( 'signup/utils', {
			getFlowSteps: function( flow ) {
				let flowSteps = null;

				if ( 'userAsFirstStepInFlow' === flow ) {
					flowSteps = [ 'user' ];
				} else {
					flowSteps = [ 'theme', 'domains', 'user' ];
				}

				return flowSteps;
			},
			getNextStepName: identity,
			getStepUrl: identity,
			getPreviousStepName: identity
		} );
	} );

	before( () => {
		User = require( '../' );
		User.prototype.translate = ( string ) => string;
	} );

	it( 'User step as first step in flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'first subheader message',
			flowName: 'userAsFirstStepInFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'Welcome to the wonderful WordPress.com community' );
	} );

	it( 'User step as not first step in flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'someOtherFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'test subheader message' );
	} );

	describe( 'Component will update', () => {
		let node, spyComponentProps, component;

		beforeEach( () => {
			node = document.createElement( 'div' );

			spyComponentProps = sinon.spy( User.prototype, 'componentWillReceiveProps' );

			let element = React.createElement( User, {
				subHeaderText: 'test subheader message',
				flowName: 'someOtherFlow'
			} );
			component = ReactDOM.render( element, node );
		} );

		afterEach( () => {
			User.prototype.componentWillReceiveProps.restore();
		} );

		it( 'Change props so User is only step in the flow', () => {
			let testProps = {
				subHeaderText: 'My test message',
				flowName: 'userAsFirstStepInFlow'
			};

			expect( spyComponentProps.calledOnce ).to.equal( false );

			ReactDOM.render( React.createElement( User, testProps ), node );

			expect( spyComponentProps.calledOnce ).to.equal( true );
			expect( component.state.subHeaderText ).to.equal( 'Welcome to the wonderful WordPress.com community' );
		} );

		it( 'Change props so User is not only step in the flow', () => {
			let testProps = {
				subHeaderText: 'My test message',
				flowName: 'another test message test'
			};

			expect( spyComponentProps.calledOnce ).to.equal( false );

			ReactDOM.render( React.createElement( User, testProps ), node );

			expect( spyComponentProps.calledOnce ).to.equal( true );
			expect( component.state.subHeaderText ).to.equal( 'My test message' );
		} );
	} );
} );
