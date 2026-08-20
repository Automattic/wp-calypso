/** @jest-environment jsdom */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WordPressAgentTelegram from '../wordpress-agent-telegram';
import type { User, WordPressAgentTelegramAuthPayload } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const USER = {
	ID: 1,
	display_name: 'Test User',
	username: 'testuser',
	email: 'test@example.com',
	email_verified: true,
	language: 'en',
} as User;
const TELEGRAM_USER: WordPressAgentTelegramAuthPayload = {
	id: 123,
	first_name: 'Test',
	username: 'telegram-user',
	auth_date: 123456789,
	hash: 'telegram-hash',
};

const interceptStatus = ( connected: boolean ) =>
	nock( API ).get( '/wpcom/v2/telegram-bot/status' ).reply( 200, { connected } );

describe( '<WordPressAgentTelegram />', () => {
	test( 'connects through the Telegram login widget', async () => {
		interceptStatus( false );
		const connectRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/connect', ( body ) => {
				expect( body ).toEqual( TELEGRAM_USER );
				return true;
			} )
			.reply( 200, {} );

		const { recordTracksEvent } = render( <WordPressAgentTelegram />, { user: USER } );

		expect( await screen.findByRole( 'heading', { name: 'Telegram' } ) ).toBeVisible();
		await waitFor( () => {
			expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument();
		} );

		act( () => window.wordpressAgentOnTelegramAuth?.( TELEGRAM_USER ) );

		await waitFor( () => expect( connectRequest.isDone() ).toBe( true ) );
		expect( await screen.findByRole( 'button', { name: 'Disconnect' } ) ).toBeVisible();
		expect(
			await screen.findByText( 'Telegram connected successfully.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dolly_telegram_widget_auth_callback',
			{ auth_date: TELEGRAM_USER.auth_date, has_username: 1 }
		);
	} );

	test( 'disconnects Telegram and shows the login widget again', async () => {
		interceptStatus( true );
		const disconnectRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/disconnect' )
			.reply( 200, {} );

		render( <WordPressAgentTelegram />, { user: USER } );

		expect( await screen.findByText( 'connected' ) ).toBeVisible();
		expect( screen.getByText( 'connected' ).parentElement ).toHaveTextContent(
			'Your account is connected.'
		);
		await userEvent.click( await screen.findByRole( 'button', { name: 'Disconnect' } ) );

		await waitFor( () => expect( disconnectRequest.isDone() ).toBe( true ) );
		await waitFor( () => {
			expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument();
		} );
		expect(
			screen.getByText( 'Connect your WordPress.com account to use WordPress Agent in Telegram.' )
		).toBeVisible();
	} );

	test( 'connects from a Telegram token callback', async () => {
		interceptStatus( false );
		const tokenRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/connect-via-token', {
				telegram_id: '123',
				token: 'token',
				ts: '456',
				bot: 'wordpressagentbot',
			} )
			.reply( 200, {} );

		render(
			<WordPressAgentTelegram
				telegramId="123"
				token="token"
				timestamp="456"
				bot="wordpressagentbot"
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
		expect(
			await screen.findByText( 'Telegram connected successfully.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Open Telegram' } ) ).toHaveAttribute(
			'href',
			'https://t.me/wordpressagentbot'
		);
	} );
} );
