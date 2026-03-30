/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import SsoBridgeError from '../error';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => '';
	config.isEnabled = () => false;
	return config;
} );

describe( '<SsoBridgeError>', () => {
	test( 'renders contact support error page', async () => {
		render( <SsoBridgeError /> );

		expect( await screen.findByRole( 'heading', { name: /unable to sign in/i } ) ).toBeVisible();
		expect( screen.getByText( /contact support/i ) ).toBeVisible();
	} );
} );
