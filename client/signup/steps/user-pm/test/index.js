/**
 * @jest-environment jsdom
 */

import { createElement } from 'react';
import ReactDOM from 'react-dom';
import { UserStepPaidMedia as User } from '../';

const noop = () => {};
const translate = ( string ) => string;

jest.mock( 'calypso/blocks/signup-form', () => require( 'calypso/components/empty-component' ) );
jest.mock( 'calypso/signup/step-wrapper', () => require( 'calypso/components/empty-component' ) );
jest.mock( 'calypso/signup/utils', () => ( {
	getFlowSteps: () => {
		const flowSteps = [ 'user-pm', 'domains-pm', 'plans-pm' ];
		return flowSteps;
	},
	getNextStepName: ( x ) => x,
	getStepUrl: ( x ) => x,
	getPreviousStepName: ( x ) => x,
} ) );

describe( '#updateSubHeaderText', () => {
	let node;
	let component;

	beforeEach( () => {
		node = document.createElement( 'div' );

		const element = createElement( User, {
			subHeaderText: 'test subheader message',
			flowName: 'onboarding-pm',
			saveSignupStep: noop,
			translate,
		} );
		component = ReactDOM.render( element, node );
	} );

	test( "should show provided subheader text when new flow doesn't have user as first step", () => {
		const testProps = {
			subHeaderText: 'My test message',
			flowName: 'onboarding-pm',
			saveSignupStep: noop,
			translate,
		};

		ReactDOM.render( createElement( User, testProps ), node );

		expect( component.getSubHeaderText() ).toBe( 'My test message' );
	} );
} );
