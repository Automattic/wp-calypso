/** @jest-environment jsdom */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WordPressAgentSlack from '../wordpress-agent-slack';
import type { User, WordPressAgentSlackConnection } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const CONNECTION: WordPressAgentSlackConnection = {
	team_id: 'T123',
	team_name: 'Example workspace',
	slack_user_id: 'U123',
	installed: true,
	is_owner: true,
};
const MEMBER_CONNECTION: WordPressAgentSlackConnection = {
	...CONNECTION,
	team_id: 'T456',
	team_name: 'Member workspace',
	is_owner: false,
};
const USER = {
	ID: 1,
	display_name: 'Test User',
	username: 'testuser',
	email: 'test@example.com',
	email_verified: true,
	language: 'en',
} as User;

const interceptConnections = ( connections: WordPressAgentSlackConnection[] ) =>
	nock( API ).get( '/wpcom/v2/wordpress-agent/slack/connections' ).reply( 200, { connections } );

describe( '<WordPressAgentSlack />', () => {
	test( 'pairs the account and refreshes the connected workspaces', async () => {
		interceptConnections( [] );
		const pairRequest = nock( API )
			.post( '/wpcom/v2/wordpress-agent/slack/pair', { token: 'pair-token' } )
			.reply( 200, {} );
		interceptConnections( [ CONNECTION ] );

		const { recordTracksEvent } = render( <WordPressAgentSlack pairToken="pair-token" />, {
			user: USER,
		} );

		expect(
			await screen.findByRole( 'heading', {
				name: 'Connect your WordPress.com account Test User (@testuser) to this Slack workspace?',
			} )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Connect account' } ) );

		await waitFor( () => expect( pairRequest.isDone() ).toBe( true ) );
		expect(
			await screen.findByText( 'Your Slack account is connected.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( await screen.findByRole( 'heading', { name: CONNECTION.team_name } ) ).toBeVisible();
		expect(
			screen.getByText( 'connected', { selector: 'strong' } ).parentElement
		).toHaveTextContent( 'Your account is connected.' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_wordpress_agent_slack_pair_success'
		);
	} );

	test( 'disconnects a Slack workspace and refreshes the list', async () => {
		interceptConnections( [ CONNECTION ] );
		const disconnectRequest = nock( API )
			.delete( `/wpcom/v2/wordpress-agent/slack/connections/${ CONNECTION.team_id }` )
			.reply( 200, {} );
		interceptConnections( [] );

		const { recordTracksEvent } = render( <WordPressAgentSlack />, { user: USER } );

		expect( await screen.findByRole( 'heading', { name: CONNECTION.team_name } ) ).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Disconnect' } ) );

		await waitFor( () => expect( disconnectRequest.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect(
				screen.queryByRole( 'heading', { name: CONNECTION.team_name } )
			).not.toBeInTheDocument()
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_wordpress_agent_slack_disconnect' );
	} );

	test( 'distinguishes workspaces whose integration the user owns', async () => {
		interceptConnections( [ CONNECTION, MEMBER_CONNECTION ] );

		render( <WordPressAgentSlack />, { user: USER } );

		const ownerWorkspace = await screen.findByRole( 'heading', { name: CONNECTION.team_name } );
		const memberWorkspace = screen.getByRole( 'heading', { name: MEMBER_CONNECTION.team_name } );

		expect( ownerWorkspace.parentElement?.parentElement ).toHaveTextContent( 'Integration owner' );
		expect( memberWorkspace.parentElement?.parentElement ).not.toHaveTextContent(
			'Integration owner'
		);
	} );

	test( 'shows the Slack installation callback status', async () => {
		interceptConnections( [] );

		const { container } = render( <WordPressAgentSlack slackStatus="connected" />, { user: USER } );

		expect(
			await screen.findByText( 'WordPress Agent was installed successfully.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add to Slack' } ) ).toBeVisible();
		expect( container.querySelector( '.wordpress-agent-slack__install-button img' ) ).toBeVisible();
	} );
} );
