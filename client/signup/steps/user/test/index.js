/**
 * @jest-environment jsdom
 */

import { createElement } from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { UserStep as User } from '../';

const noop = () => {};
const translate = ( string ) => string;

jest.mock( 'calypso/blocks/signup-form', () => require( 'calypso/components/empty-component' ) );
jest.mock( 'calypso/signup/step-wrapper', () => require( 'calypso/components/empty-component' ) );
jest.mock( 'calypso/signup/utils', () => ( {
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
	isVideoPressFlow: () => false,
	isP2Flow: () => false,
} ) );

describe( '#signupStep User', () => {
	let testElement;
	let rendered;

	test( 'should show community subheader text if User step is first in the flow', () => {
		testElement = createElement( User, {
			subHeaderText: 'first subheader message',
			flowName: 'userAsFirstStepInFlow',
			saveSignupStep: noop,
			translate,
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.getSubHeaderText() ).toBe( 'Welcome to the WordPress.com community.' );
	} );

	test( 'should show provided subheader text if User step is not first in the flow', () => {
		testElement = createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'someOtherFlow',
			saveSignupStep: noop,
			translate,
		} );
		rendered = TestUtils.renderIntoDocument( testElement );

		expect( rendered.getSubHeaderText() ).toBe( 'test subheader message' );
	} );

	describe( '#updateSubHeaderText', () => {
		let node;
		let component;

		beforeEach( () => {
			node = document.createElement( 'div' );

			const element = createElement( User, {
				subHeaderText: 'test subheader message',
				flowName: 'someOtherFlow',
				saveSignupStep: noop,
				translate,
			} );
			component = ReactDOM.render( element, node );
		} );

		test( 'should show community subheader text when new flow has user as first step', () => {
			const testProps = {
				subHeaderText: 'My test message',
				flowName: 'userAsFirstStepInFlow',
				saveSignupStep: noop,
				translate,
			};

			ReactDOM.render( createElement( User, testProps ), node );

			expect( component.getSubHeaderText() ).toBe( 'Welcome to the WordPress.com community.' );
		} );

		test( "should show provided subheader text when new flow doesn't have user as first step", () => {
			const testProps = {
				subHeaderText: 'My test message',
				flowName: 'another test message test',
				saveSignupStep: noop,
				translate,
			};

			ReactDOM.render( createElement( User, testProps ), node );

			expect( component.getSubHeaderText() ).toBe( 'My test message' );
		} );
	} );
} );
