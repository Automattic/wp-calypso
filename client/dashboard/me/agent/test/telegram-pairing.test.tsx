/** @jest-environment jsdom */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import TelegramPairing from '../telegram-pairing';
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

describe( '<TelegramPairing />', () => {
	test( 'connects from a Telegram token callback', async () => {
		const tokenRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/connect-via-token', {
				telegram_id: '123',
				token: 'token',
				ts: '456',
				bot: 'wordpressagentbot',
			} )
			.reply( 200, {} );
		const onConnected = jest.fn();

		const { recordTracksEvent } = render(
			<TelegramPairing
				telegramId="123"
				token="token"
				timestamp="456"
				bot="wordpressagentbot"
				onConnected={ onConnected }
				onCancel={ jest.fn() }
			/>,
			{ user: USER }
		);

		expect(
			await screen.findByRole( 'heading', {
				name: 'Connect your WordPress.com account Test User (@testuser) to Telegram?',
			} )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Connect' } ) );

		await waitFor( () => expect( tokenRequest.isDone() ).toBe( true ) );
		await waitFor( () => expect( onConnected ).toHaveBeenCalled() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_telegram_connect_via_token_success',
			{
				source: 'calypso_token',
			}
		);
	} );

	test( 'cancels without connecting', async () => {
		const onCancel = jest.fn();
		const onConnected = jest.fn();

		render(
			<TelegramPairing
				telegramId="123"
				token="token"
				timestamp="456"
				onConnected={ onConnected }
				onCancel={ onCancel }
			/>,
			{ user: USER }
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );

		expect( onCancel ).toHaveBeenCalled();
		expect( onConnected ).not.toHaveBeenCalled();
	} );
} );
