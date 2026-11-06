/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import WordPressAgent from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => true ),
	} );
} );

jest.mock( '../../../../me/mcp/tracks', () => ( {
	useMcpTracksAudienceProps: () => ( {} ),
} ) );
jest.mock( '../../../components/component-view-tracker', () => () => null );
jest.mock( '../../mcp/wordpress-agent-email', () => () => null );
jest.mock( '../../mcp/wordpress-agent-telegram', () => ( props: object ) => (
	<p>{ `telegram ${ JSON.stringify( props ) }` }</p>
) );
jest.mock( '../../mcp/wordpress-agent-slack', () => ( props: object ) => (
	<p>{ `slack ${ JSON.stringify( props ) }` }</p>
) );

test( 'passes the connection callbacks on as written, then removes them from the URL', async () => {
	window.history.replaceState(
		null,
		'',
		'/me/agent?telegram_id=123456789&token=abc&ts=1730000000&bot=wpagent_bot&pair_token=p1&slack=connected&tab=1'
	);

	render( <WordPressAgent /> );

	expect(
		screen.getByText(
			'telegram {"telegramId":"123456789","token":"abc","timestamp":"1730000000","bot":"wpagent_bot"}'
		)
	).toBeVisible();
	expect( screen.getByText( 'slack {"pairToken":"p1","slackStatus":"connected"}' ) ).toBeVisible();
	await waitFor( () => expect( window.location.search ).toBe( '?tab=1' ) );
	expect( screen.getByText( /"telegramId":"123456789"/ ) ).toBeVisible();
} );
