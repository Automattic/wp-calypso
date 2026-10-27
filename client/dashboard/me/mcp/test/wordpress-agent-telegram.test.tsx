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
	test( 'requires confirmation before connecting through the Telegram login widget', async () => {
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

		expect( screen.getByText( 'Telegram account: @telegram-user (ID: 123)' ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Telegram' } ) ).not.toBeInTheDocument();
		expect( connectRequest.isDone() ).toBe( false );
		await userEvent.click( screen.getByRole( 'button', { name: 'Connect' } ) );

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

	test( 'discards a widget connection on cancel', async () => {
		interceptStatus( false );
		const connectRequest = nock( API ).post( '/wpcom/v2/telegram-bot/connect' ).reply( 200, {} );
		render( <WordPressAgentTelegram />, { user: USER } );
		await waitFor( () => expect( window.wordpressAgentOnTelegramAuth ).toBeDefined() );
		act( () => window.wordpressAgentOnTelegramAuth?.( TELEGRAM_USER ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( screen.queryByRole( 'button', { name: 'Connect' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Telegram' } ) ).toBeVisible();
		await waitFor( () =>
			expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument()
		);
		expect( connectRequest.isDone() ).toBe( false );
		act( () => window.wordpressAgentOnTelegramAuth?.( { ...TELEGRAM_USER, id: 456 } ) );
		expect( screen.getByText( 'Telegram account: @telegram-user (ID: 456)' ) ).toBeVisible();
		expect( connectRequest.isDone() ).toBe( false );
	} );

	test( 'keeps the displayed widget identity until it is confirmed or cancelled', async () => {
		interceptStatus( false );
		const connectRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/connect', ( body ) => {
				expect( body ).toEqual( TELEGRAM_USER );
				return true;
			} )
			.reply( 200, {} );
		render( <WordPressAgentTelegram />, { user: USER } );
		await waitFor( () => expect( window.wordpressAgentOnTelegramAuth ).toBeDefined() );
		act( () => window.wordpressAgentOnTelegramAuth?.( TELEGRAM_USER ) );
		act( () => window.wordpressAgentOnTelegramAuth?.( { ...TELEGRAM_USER, id: 456 } ) );
		expect( screen.getByText( 'Telegram account: @telegram-user (ID: 123)' ) ).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Connect' } ) );
		await waitFor( () => expect( connectRequest.isDone() ).toBe( true ) );
	} );

	test.each( [ { telegramId: '123' }, { bot: 'wordpressagentbot' } ] )(
		'allows widget login after an incomplete token callback: %o',
		async ( props ) => {
			interceptStatus( false );
			const connectRequest = nock( API ).post( '/wpcom/v2/telegram-bot/connect' ).reply( 200, {} );
			render( <WordPressAgentTelegram { ...props } />, { user: USER } );
			expect(
				screen.getByText( 'This Telegram connection link is invalid or incomplete.', {
					selector: '.components-notice__content',
				} )
			).toBeVisible();
			await waitFor( () =>
				expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument()
			);
			act( () => window.wordpressAgentOnTelegramAuth?.( TELEGRAM_USER ) );
			expect( screen.getByText( 'Telegram account: @telegram-user (ID: 123)' ) ).toBeVisible();
			expect( connectRequest.isDone() ).toBe( false );
			await userEvent.click( screen.getByRole( 'button', { name: 'Connect' } ) );
			await waitFor( () => expect( connectRequest.isDone() ).toBe( true ) );
		}
	);

	test( 'restores the widget after cancelling a token connection', async () => {
		interceptStatus( false );
		const tokenRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/connect-via-token' )
			.reply( 200, {} );
		render( <WordPressAgentTelegram telegramId="123" token="token" timestamp="456" />, {
			user: USER,
		} );
		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( tokenRequest.isDone() ).toBe( false );
		expect( screen.getByRole( 'heading', { name: 'Telegram' } ) ).toBeVisible();
		await waitFor( () =>
			expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument()
		);
		act( () => window.wordpressAgentOnTelegramAuth?.( TELEGRAM_USER ) );
		expect( screen.getByText( 'Telegram account: @telegram-user (ID: 123)' ) ).toBeVisible();
	} );

	test( 'disconnects Telegram and shows the login widget again', async () => {
		interceptStatus( true );
		const disconnectRequest = nock( API )
			.post( '/wpcom/v2/telegram-bot/disconnect' )
			.reply( 200, {} );

		render( <WordPressAgentTelegram />, { user: USER } );

		expect(
			await screen.findByText( 'Message your agent from Telegram for quick updates on the go.' )
		).toBeVisible();
		await userEvent.click( await screen.findByRole( 'button', { name: 'Disconnect' } ) );

		await waitFor( () => expect( disconnectRequest.isDone() ).toBe( true ) );
		await waitFor( () => {
			expect( document.querySelector( 'script[data-telegram-login]' ) ).toBeInTheDocument();
		} );
		expect(
			screen.getByText( 'Message your agent from Telegram for quick updates on the go.' )
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
		expect( tokenRequest.isDone() ).toBe( false );
		expect( screen.queryByRole( 'heading', { name: 'Telegram' } ) ).not.toBeInTheDocument();
		expect( window.wordpressAgentOnTelegramAuth ).toBeUndefined();
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
