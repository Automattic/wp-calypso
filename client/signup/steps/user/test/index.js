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
			'Just a little reminder that by continuing with any of the options below'
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
			'Just a little reminder that by continuing with any of the options below'
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
				'Just a little reminder that by continuing with any of the options below'
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
				'Just a little reminder that by continuing with any of the options below'
			);
		} );
	} );
} );
