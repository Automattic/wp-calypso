/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import SsoBridge from '../index';

let mockSearchParams: Record< string, string | undefined > = {};

jest.mock( '@automattic/calypso-config', () => {
	const config = () => '';
	config.isEnabled = () => false;
	return config;
} );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useSearch: ( { from }: { from: string } ) => {
		if ( from === '/sso-bridge' ) {
			return mockSearchParams;
		}
		return {};
	},
} ) );

describe( '<SsoBridge>', () => {
	test( 'renders contact support error page when broker-sso-auth-redirect is set', async () => {
		mockSearchParams = { 'broker-sso-auth-redirect': '1' };

		render( <SsoBridge /> );

		expect( await screen.findByRole( 'heading', { name: /unable to sign in/i } ) ).toBeVisible();
		expect( screen.getByText( /contact support/i ) ).toBeVisible();
	} );

	test( 'renders loading skeleton for normal SSO flow', () => {
		mockSearchParams = {};

		render( <SsoBridge /> );

		expect( document.querySelector( '.components-v-stack' ) ).toBeVisible();
	} );
} );
