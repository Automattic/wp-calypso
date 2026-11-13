/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import WordPressAgent from '../index';

vi.mock( '@automattic/calypso-config', () => {
	const fn = vi.fn( () => '' );
	return {
		...Object.assign( fn, {
			__esModule: true,
			default: fn,
			isEnabled: vi.fn( () => true ),
		} ),
	};
} );

vi.mock( '../../../../me/mcp/tracks', () => ( {
	useMcpTracksAudienceProps: () => ( {} ),
} ) );
vi.mock( '../../../components/component-view-tracker', () => ( { default: () => null } ) );
vi.mock( '../../mcp/wordpress-agent-email', () => ( { default: () => null } ) );
vi.mock( '../../mcp/wordpress-agent-telegram', () => ( {
	default: ( props: object ) => <p>{ `telegram ${ JSON.stringify( props ) }` }</p>,
} ) );
vi.mock( '../../mcp/wordpress-agent-slack', () => ( {
	default: ( props: object ) => <p>{ `slack ${ JSON.stringify( props ) }` }</p>,
} ) );

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
