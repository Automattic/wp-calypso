/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerProvider, useComposer, type ActiveMode } from '../../composer-provider';
import { TimelineComposePill } from '../timeline-compose-pill';
import type { AtmosphereConnection } from '@automattic/api-core';

const fakeConnection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:alice',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	avatar: 'https://example.test/a.jpg',
};

function Spy( { onMode }: { onMode: ( m: ActiveMode ) => void } ) {
	const { mode } = useComposer();
	if ( mode ) {
		onMode( mode );
	}
	return null;
}

// Tolerate either apostrophe form in matchers.
const PLACEHOLDER_RE = /what['’]s up/i;

describe( '<TimelineComposePill>', () => {
	it( 'renders the avatar, placeholder, and is a single button', () => {
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
			</ComposerProvider>
		);

		expect( screen.getByRole( 'button', { name: PLACEHOLDER_RE } ) ).toBeVisible();
		expect( screen.getByText( PLACEHOLDER_RE ) ).toBeVisible();

		// Avatar is decorative — aria-hidden keeps it out of the a11y tree.
		expect( screen.queryByRole( 'img' ) ).toBeNull();
	} );

	it( 'opens the composer in standalone mode with entry_point=timeline_inline', async () => {
		const user = userEvent.setup();
		const onMode = jest.fn();
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: PLACEHOLDER_RE } ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( {
				kind: 'standalone',
				entry_point: 'timeline_inline',
				connectionId: 42,
			} )
		);
	} );

	it( 'forwards entryPoint=profile_inline to the standalone mode', async () => {
		const user = userEvent.setup();
		const onMode = jest.fn();
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="profile_inline" />
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: PLACEHOLDER_RE } ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( {
				kind: 'standalone',
				entry_point: 'profile_inline',
				connectionId: 42,
			} )
		);
	} );
} );
