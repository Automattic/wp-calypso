/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordPressAgentCard } from '../wordpress-agent-card';
import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';

const mockHandleClickLink = jest.fn( ( event: ReactMouseEvent< HTMLAnchorElement > ) =>
	event.preventDefault()
);

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component: ComponentType ) => Component,
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( '../use-handle-click-link', () => ( {
	useHandleClickLink: () => mockHandleClickLink,
} ) );

describe( 'WordPressAgentCard', () => {
	beforeEach( () => {
		mockHandleClickLink.mockClear();
	} );

	it( 'links to the WordPress Agent connections page without showing connection status', async () => {
		const user = userEvent.setup();
		render( <WordPressAgentCard /> );

		expect( screen.getByText( 'WordPress Agent' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Manage your site, create content, and monitor performance with WordPress Agent. Connect through Telegram, email, or Slack.'
			)
		).toBeVisible();
		expect( screen.queryByText( /connected/i ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Disconnect' } ) ).not.toBeInTheDocument();

		const link = screen.getByRole( 'link', { name: 'Manage connections' } );
		expect( link ).toHaveAttribute( 'href', '/me/agent' );

		await user.click( link );
		expect( mockHandleClickLink ).toHaveBeenCalledTimes( 1 );
	} );
} );
