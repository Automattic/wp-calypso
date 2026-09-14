/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import LoginContextProvider from 'calypso/login/login-context';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import OneLoginLayout, { ensureHeadingProvided } from '../one-login-layout';

describe( 'ensureHeadingProvided', () => {
	const originalEnv = process.env.NODE_ENV;

	afterEach( () => {
		process.env.NODE_ENV = originalEnv;
	} );

	test( 'returns the heading when provided', () => {
		expect( ensureHeadingProvided( 'Hello' ) ).toBe( 'Hello' );
	} );

	test( 'throws in non-production environments when heading is missing', () => {
		expect( () => ensureHeadingProvided( undefined ) ).toThrow(
			/OneLoginLayout rendered without heading text/i
		);
	} );

	test( 'does not throw in production even when heading is missing', () => {
		process.env.NODE_ENV = 'production';
		expect( ensureHeadingProvided( undefined ) ).toBeNull();
	} );
} );

describe( 'OneLoginLayout', () => {
	const renderLayout = ( loginUrl: string ) => (
		<LoginContextProvider initialHeading="Create your account" initialSubHeading="Sub">
			<OneLoginLayout isJetpack={ false } isSectionSignup loginUrl={ loginUrl }>
				<div>form</div>
			</OneLoginLayout>
		</LoginContextProvider>
	);

	test( 'keeps the same Log in anchor mounted when the login URL changes', () => {
		const { rerender } = renderWithProvider( renderLayout( '/log-in?email_address=' ) );

		const link = screen.getByRole( 'link', { name: 'Log in' } );

		rerender( renderLayout( '/log-in?email_address=someone%40example.com' ) );

		const linkAfterRerender = screen.getByRole( 'link', { name: 'Log in' } );
		expect( linkAfterRerender ).toBe( link );
		expect( linkAfterRerender ).toHaveAttribute(
			'href',
			'/log-in?email_address=someone%40example.com'
		);
	} );
} );
