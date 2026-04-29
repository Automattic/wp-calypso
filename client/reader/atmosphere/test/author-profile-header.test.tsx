/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthorProfileHeader } from '../author-profile-header';
import type { AtmosphereConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const connection: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

beforeEach( () => {
	( page as unknown as jest.Mock ).mockReset();
} );

describe( 'AuthorProfileHeader', () => {
	it( 'renders a Back button', () => {
		render( <AuthorProfileHeader connection={ connection } /> );
		expect( screen.getByRole( 'button', { name: /back/i } ) ).toBeVisible();
	} );

	it( 'navigates to the connection timeline on click', async () => {
		const user = userEvent.setup();
		render( <AuthorProfileHeader connection={ connection } /> );
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' );
	} );

	it( 'invokes onBackToTimeline before navigating', async () => {
		const onBackToTimeline = jest.fn();
		const user = userEvent.setup();
		render(
			<AuthorProfileHeader connection={ connection } onBackToTimeline={ onBackToTimeline } />
		);
		await user.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( onBackToTimeline ).toHaveBeenCalledTimes( 1 );
		expect( page ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' );
	} );
} );
