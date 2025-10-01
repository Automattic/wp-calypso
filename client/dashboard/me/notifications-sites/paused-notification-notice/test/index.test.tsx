/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { PausedNotificationNotice } from '../index';

describe( 'PausedNotificationNotice', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();
	} );

	it( 'renders the notice when the browser notifications are blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: true,
		} );

		render( <PausedNotificationNotice /> );

		expect(
			await screen.findByText( 'Email updates are turned off until you change your settings' )
		).toBeVisible();
	} );

	it( 'does not render the notice when the browser notifications are not blocked', async () => {
		const api = nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/me/settings' )
			.reply( 200, {
				subscription_delivery_email_blocked: false,
			} );

		render( <PausedNotificationNotice /> );

		await waitFor( () => {
			expect( api.isDone() ).toBe( true );
		} );

		expect(
			screen.queryByText( 'Email updates are turned off until you change your settings' )
		).not.toBeInTheDocument();
	} );
} );
