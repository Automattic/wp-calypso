/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { ComposerProvider, useComposer, type ActiveMode } from '../../composer-provider';
import { TimelineComposePill } from '../timeline-compose-pill';
import type { AtmosphereConnection } from '@automattic/api-core';

// `ComposerProvider` consumes `useImageUploads`, which requires a
// `QueryClientProvider` in the tree, and dispatches Tracks events via
// `useDispatch`, which requires a Redux `<Provider>`. Each test gets its
// own client + a permissive noop store so cached state and dispatched
// actions never leak between cases.
function withProviders( ui: React.ReactNode ) {
	const store = createStore( ( s = {} ) => s, applyMiddleware( thunkMiddleware ) );
	return (
		<QueryClientProvider client={ new QueryClient() }>
			<Provider store={ store }>{ ui }</Provider>
		</QueryClientProvider>
	);
}

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
			withProviders(
				<ComposerProvider connectionId={ 42 }>
					<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
				</ComposerProvider>
			)
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
			withProviders(
				<ComposerProvider connectionId={ 42 }>
					<TimelineComposePill connection={ fakeConnection } entryPoint="timeline_inline" />
					<Spy onMode={ onMode } />
				</ComposerProvider>
			)
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
			withProviders(
				<ComposerProvider connectionId={ 42 }>
					<TimelineComposePill connection={ fakeConnection } entryPoint="profile_inline" />
					<Spy onMode={ onMode } />
				</ComposerProvider>
			)
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
