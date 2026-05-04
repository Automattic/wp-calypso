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

// Match either a curly or straight apostrophe inside test matchers — the
// production placeholder uses the curly form (CLAUDE.md preserves it).
const PLACEHOLDER_RE = /what['’]s up/i;

describe( '<TimelineComposePill>', () => {
	it( 'renders the avatar, placeholder, and is a single button', () => {
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
			</ComposerProvider>
		);

		// One accessible button, named after the placeholder copy.
		expect( screen.getByRole( 'button', { name: PLACEHOLDER_RE } ) ).toBeVisible();

		// Placeholder text is rendered visibly inside the button.
		expect( screen.getByText( PLACEHOLDER_RE ) ).toBeVisible();

		// Avatar is decorative — must be aria-hidden so it's not in the
		// accessibility tree, hence not queryable via getByRole('img').
		const avatar = screen.queryByRole( 'img' );
		expect( avatar ).toBeNull();
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
