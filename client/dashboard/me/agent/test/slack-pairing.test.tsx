/** @jest-environment jsdom */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SlackPairing from '../slack-pairing';
import type { User } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const USER = {
	ID: 1,
	display_name: 'Test User',
	username: 'testuser',
	email: 'test@example.com',
	email_verified: true,
	language: 'en',
} as User;

describe( '<SlackPairing />', () => {
	test( 'pairs the account and reports the connection', async () => {
		const pairRequest = nock( API )
			.post( '/wpcom/v2/wordpress-agent/slack/pair', { token: 'pair-token' } )
			.reply( 200, {} );
		const onConnected = jest.fn();

		const { recordTracksEvent } = render(
			<SlackPairing pairToken="pair-token" onConnected={ onConnected } onCancel={ jest.fn() } />,
			{ user: USER }
		);

		expect(
			await screen.findByRole( 'heading', {
				name: 'Connect your WordPress.com account Test User (@testuser) to this Slack workspace?',
			} )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Connect account' } ) );

		await waitFor( () => expect( pairRequest.isDone() ).toBe( true ) );
		await waitFor( () => expect( onConnected ).toHaveBeenCalled() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_wordpress_agent_slack_pair_success'
		);
	} );

	test( 'cancels without pairing', async () => {
		const onCancel = jest.fn();
		const onConnected = jest.fn();

		render(
			<SlackPairing pairToken="pair-token" onConnected={ onConnected } onCancel={ onCancel } />,
			{ user: USER }
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );

		expect( onCancel ).toHaveBeenCalled();
		expect( onConnected ).not.toHaveBeenCalled();
	} );
} );
