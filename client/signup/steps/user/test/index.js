/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import sinon from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { UserStep as User } from '../';

jest.mock( 'blocks/signup-form', () => require( 'components/empty-component' ) );
jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
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
	getNextStepName: ( x ) => x,
	getStepUrl: ( x ) => x,
	getPreviousStepName: ( x ) => x,
} ) );

describe( '#signupStep User', () => {
	let testElement, rendered;

	test( 'should show community subheader text if User step is first in the flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'first subheader message',
			flowName: 'userAsFirstStepInFlow',
			saveSignupStep: noop,
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'Welcome to the WordPress.com community.' );
	} );

	test( 'should show provided subheader text if User step is not first in the flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'someOtherFlow',
			saveSignupStep: noop,
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'test subheader message' );
	} );

	describe( '#updateComponentProps', () => {
		let node, spyComponentProps, component;

		beforeEach( () => {
			node = document.createElement( 'div' );

			spyComponentProps = sinon.spy( User.prototype, 'UNSAFE_componentWillReceiveProps' );

			const element = React.createElement( User, {
				subHeaderText: 'test subheader message',
				flowName: 'someOtherFlow',
				saveSignupStep: noop,
			} );
			component = ReactDOM.render( element, node );
		} );

		afterEach( () => {
			User.prototype.UNSAFE_componentWillReceiveProps.restore();
		} );

		test( 'should show community subheader text when new flow has user as first step', () => {
			const testProps = {
				subHeaderText: 'My test message',
				flowName: 'userAsFirstStepInFlow',
				saveSignupStep: noop,
			};

			expect( spyComponentProps.calledOnce ).to.equal( false );

			ReactDOM.render( React.createElement( User, testProps ), node );

			expect( spyComponentProps.calledOnce ).to.equal( true );
			expect( component.state.subHeaderText ).to.equal( 'Welcome to the WordPress.com community.' );
		} );

		test( "should show provided subheader text when new flow doesn't have user as first step", () => {
			const testProps = {
				subHeaderText: 'My test message',
				flowName: 'another test message test',
				saveSignupStep: noop,
			};

			expect( spyComponentProps.calledOnce ).to.equal( false );

			ReactDOM.render( React.createElement( User, testProps ), node );

			expect( spyComponentProps.calledOnce ).to.equal( true );
			expect( component.state.subHeaderText ).to.equal( 'My test message' );
		} );
	} );
} );
