import { expect } from 'chai';
import TestUtils from 'react-addons-test-utils' ;
import useMockery from 'test/helpers/use-mockery' ;

import React from 'react';

import identity from 'lodash/identity';
import useFakeDom from 'test/helpers/use-fake-dom';

describe.only( '#signupStep User', () => {
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

	it.only( 'User step as first step in flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'first subheader message',
			flowName: 'userAsFirstStepInFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'Welcome to the wonderful WordPress.com community' );
	} );

	it.only( 'User step as not first step in flow', () => {
		testElement = React.createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'someOtherFlow'
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.state.subHeaderText ).to.equal( 'test subheader message' );
	} );
} );
