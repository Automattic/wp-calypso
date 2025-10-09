/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { NotificationsEmailsSummary } from '../summary';

describe( 'NotificationsEmailsSummary', () => {
	it( 'renders a notification when all emails are paused', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: true,
		} );

		render( <NotificationsEmailsSummary /> );

		await waitFor( () => {
			expect( screen.getByText( 'All emails are paused' ) ).toBeVisible();
		} );
	} );

	it( 'doesnt render a notification when all emails are not paused', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <NotificationsEmailsSummary /> );

		expect( screen.queryByText( 'All emails are paused' ) ).not.toBeInTheDocument();
	} );
} );
