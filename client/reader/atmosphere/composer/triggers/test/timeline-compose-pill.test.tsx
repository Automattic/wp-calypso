/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerProvider, useComposer } from '../../composer-provider';
import { TimelineComposePill } from '../timeline-compose-pill';
import type { AtmosphereConnection } from '@automattic/api-core';

const fakeConnection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:alice',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	avatar: 'https://example.test/a.jpg',
};

function Spy( { onMode }: { onMode: ( m: unknown ) => void } ) {
	const { mode } = useComposer();
	if ( mode ) {
		onMode( mode );
	}
	return null;
}

describe( '<TimelineComposePill>', () => {
	it( 'opens the composer in standalone mode with entry_point=timeline_inline', async () => {
		const user = userEvent.setup();
		const onMode = jest.fn();
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( {
				kind: 'standalone',
				entry_point: 'timeline_inline',
				connectionId: 42,
			} )
		);
	} );

	it( 'reports profile_inline when configured for the profile tab', async () => {
		const user = userEvent.setup();
		const onMode = jest.fn();
		render(
			<ComposerProvider connectionId={ 42 }>
				<TimelineComposePill connection={ fakeConnection } entryPoint="profile_inline" />
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button' ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( { entry_point: 'profile_inline' } )
		);
	} );
} );
