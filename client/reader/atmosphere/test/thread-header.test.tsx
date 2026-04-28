/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThreadHeader } from '../thread-header';
import type { AtmosphereConnection } from '@automattic/api-core';

const connection: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

describe( 'ThreadHeader', () => {
	it( 'renders a generic Post title (author info lives in the post card below)', () => {
		render( <ThreadHeader connection={ connection } /> );
		expect( screen.getByRole( 'heading', { level: 1, name: /post/i } ) ).toBeVisible();
	} );

	it( 'renders the back-to-timeline link with the correct href and accessible name', () => {
		render( <ThreadHeader connection={ connection } /> );
		const back = screen.getByRole( 'link', { name: /back to timeline/i } );
		expect( back ).toHaveAttribute( 'href', '/reader/atmosphere/7/timeline' );
	} );

	it( 'invokes onBackToTimeline callback when the back link is clicked', async () => {
		const onBackToTimeline = jest.fn();
		const user = userEvent.setup();
		render( <ThreadHeader connection={ connection } onBackToTimeline={ onBackToTimeline } /> );
		const back = screen.getByRole( 'link', { name: /back to timeline/i } );
		await user.click( back );
		expect( onBackToTimeline ).toHaveBeenCalledTimes( 1 );
	} );
} );
