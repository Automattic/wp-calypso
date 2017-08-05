/** @jest-environment jsdom */
jest.mock( 'components/signup-form', () => require( 'components/empty-component' ) );
jest.mock( 'lib/abtest', () => () => {} );
jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'signup/step-wrapper', () => require( 'components/empty-component' ) );
jest.mock( 'signup/utils', () => ( {
	getFlowSteps: ( flow ) => {
		let flowSteps = null;

		if ( 'userAsFirstStepInFlow' === flow ) {
			flowSteps = [ 'user' ];
		} else {
			flowSteps = [ 'theme', 'domains', 'user' ];
		}

		return flowSteps;
	},
	getNextStepName: x => x,
	getStepUrl: x => x,
	getPreviousStepName: x => x
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils' ;

/**
 * Internal dependencies
 */
import { UserStep as User } from '../';

describe( '#signupStep User', () => {
	let testElement, rendered;

	it( 'should show community subheader text if User step is first in the flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'first subheader message',
			flowName: 'userAsFirstStepInFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'Welcome to the wonderful WordPress.com community' );
	} );

	it( 'should show provided subheader text if User step is not first in the flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'someOtherFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'test subheader message' );
	} );

	describe( '#updateComponentProps', () => {
		let node, spyComponentProps, component;

		beforeEach( () => {
			node = document.createElement( 'div' );

			spyComponentProps = sinon.spy( User.prototype, 'componentWillReceiveProps' );

			const element = React.createElement( User, {
				subHeaderText: 'test subheader message',
				flowName: 'someOtherFlow'
			} );
			component = ReactDOM.render( element, node );
		} );

		afterEach( () => {
			User.prototype.componentWillReceiveProps.restore();
		} );

		it( 'should show community subheader text when new flow has user as first step', () => {
			const testProps = {
				subHeaderText: 'My test message',
				flowName: 'userAsFirstStepInFlow'
			};

			expect( spyComponentProps.calledOnce ).to.equal( false );

			ReactDOM.render( React.createElement( User, testProps ), node );

			expect( spyComponentProps.calledOnce ).to.equal( true );
			expect( component.state.subHeaderText ).to.equal( 'Welcome to the wonderful WordPress.com community' );
		} );

		it( 'should show provided subheader text when new flow doesn\'t have user as first step', () => {
			const testProps = {
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
