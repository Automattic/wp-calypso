/**
 * @jest-environment jsdom
 */

import { createElement } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
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
} ) );

describe( '#signupStep User', () => {
	const getSubHeaderEl = ( container ) =>
		container.querySelector( '.wp-login__one-login-layout-heading-subtext' );

	test( 'should show subheader TOS text when using unified login layout', () => {
		const { container } = renderWithProvider(
			createElement( User, {
				subHeaderText: 'first subheader message',
				flowName: 'userAsFirstStepInFlow',
				saveSignupStep: noop,
				translate,
			} ),
			{ initialPath: '/start/account' }
		);

		expect( getSubHeaderEl( container ) ).toHaveTextContent(
			'By continuing with any of the options below'
		);
	} );

	test( 'should show subheader TOS text for non-first step as well', () => {
		const { container } = renderWithProvider(
			createElement( User, {
				subHeaderText: 'test subheader message',
				flowName: 'someOtherFlow',
				saveSignupStep: noop,
				translate,
			} ),
			{ initialPath: '/start/account' }
		);

		expect( getSubHeaderEl( container ) ).toHaveTextContent(
			'By continuing with any of the options below'
		);
	} );

	describe( '#updateSubHeaderText', () => {
		test( 'should keep subheader TOS text when rerendering with user first in flow', () => {
			const { container, rerender } = renderWithProvider(
				createElement( User, {
					subHeaderText: 'test subheader message',
					flowName: 'someOtherFlow',
					saveSignupStep: noop,
					translate,
				} ),
				{ initialPath: '/start/account' }
			);

			rerender(
				createElement( User, {
					subHeaderText: 'My test message',
					flowName: 'userAsFirstStepInFlow',
					saveSignupStep: noop,
					translate,
				} )
			);

			expect( getSubHeaderEl( container ) ).toHaveTextContent(
				'By continuing with any of the options below'
			);
		} );

		test( 'should keep subheader TOS text when rerendering with non-first step', () => {
			const { container, rerender } = renderWithProvider(
				createElement( User, {
					subHeaderText: 'test subheader message',
					flowName: 'someOtherFlow',
					saveSignupStep: noop,
					translate,
				} ),
				{ initialPath: '/start/account' }
			);

			rerender(
				createElement( User, {
					subHeaderText: 'My test message',
					flowName: 'another test message test',
					saveSignupStep: noop,
					translate,
				} )
			);

			expect( getSubHeaderEl( container ) ).toHaveTextContent(
				'By continuing with any of the options below'
			);
		} );
	} );

	describe( '#submit', () => {
		test( 'attributes Akismet account creation to the Akismet signup flow', () => {
			const submitSignupStep = jest.fn();
			const user = new User( {
				flowName: 'account',
				stepName: 'user',
				isAkismet: true,
				submitSignupStep,
			} );

			user.submit( { queryArgs: {} } );

			expect( submitSignupStep ).toHaveBeenCalledWith(
				expect.objectContaining( {
					flowName: 'account',
					signupFlowName: 'akismet',
				} ),
				{}
			);
		} );

		test( 'does not override attribution for other account creation', () => {
			const submitSignupStep = jest.fn();
			const user = new User( {
				flowName: 'account',
				stepName: 'user',
				isAkismet: false,
				submitSignupStep,
			} );

			user.submit( { queryArgs: {} } );

			const submittedStep = submitSignupStep.mock.calls[ 0 ][ 0 ];
			expect( submittedStep.flowName ).toBe( 'account' );
			expect( submittedStep ).not.toHaveProperty( 'signupFlowName' );
		} );
	} );
} );
