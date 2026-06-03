/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import { QueryClient } from '@tanstack/react-query';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { ComposerProvider, useComposer, type ComposerConfig } from 'calypso/reader/social/composer';
import { testComposerConfig } from 'calypso/reader/social/composer/test-config';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useFediverseComposerMedia } from '../use-fediverse-composer-media';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const configWithFediverseMedia: ComposerConfig< any, any, any > = {
	...testComposerConfig,
	useMedia: useFediverseComposerMedia,
};

// `recordReaderTracksEvent` is a thunk that reads the follows query cache.
// The test store doesn't seed that branch, so dispatching the real thunk
// throws on click. Stub at file scope so every test is isolated from
// the analytics pipeline.
beforeEach( () => {
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
} );

afterEach( () => {
	jest.restoreAllMocks();
} );

function renderTrigger() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );

	let composer: ReturnType< typeof useComposer > | null = null;

	function Probe( { children }: { children: ReactNode } ) {
		composer = useComposer();
		useEffect( () => {
			if ( ! composer!.mode ) {
				composer!.openComposer( { kind: 'standalone', entry_point: 'fab' } );
			}
			// Only run on mount; subsequent re-renders are not the trigger we want.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );
		return <>{ children }</>;
	}

	function Trigger() {
		const { mediaSlot } = useComposer();
		return <>{ mediaSlot.renderFooterTrigger() }</>;
	}

	const result = renderWithProvider(
		<ComposerProvider connectionId={ 1 } config={ configWithFediverseMedia }>
			<Probe>
				<Trigger />
			</Probe>
		</ComposerProvider>,
		{ queryClient }
	);

	return { ...result, getComposer: () => composer! };
}

describe( 'useFediverseComposerMedia — trigger shape', () => {
	it( 'renders a footer-start button matching atmosphere/Mastodon shape', () => {
		renderTrigger();

		const button = screen.getByRole( 'button', { name: /add media/i } );
		expect( button ).toBeVisible();
		// Same class as atmosphere/mastosondon `<button className="social-composer__media">`
		// — the unified-experience requirement from CM-726.
		expect( button ).toHaveClass( 'social-composer__media' );
	} );
} );

describe( 'useFediverseComposerMedia — click behaviour', () => {
	it( 'flips the provider’s hasRequestedMediaHandoff flag on click', async () => {
		const user = userEvent.setup();
		const { getComposer } = renderTrigger();

		expect( getComposer().hasRequestedMediaHandoff ).toBe( false );

		const button = screen.getByRole( 'button', { name: /add media/i } );
		await user.click( button );

		expect( getComposer().hasRequestedMediaHandoff ).toBe( true );
	} );

	it( 'dispatches the media_handoff_clicked Tracks event with connection + mode_kind props', async () => {
		const user = userEvent.setup();
		renderTrigger();

		const button = screen.getByRole( 'button', { name: /add media/i } );
		await user.click( button );

		const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const clickedCalls = recordSpy.mock.calls.filter(
			( call ) => call[ 0 ] === 'calypso_reader_fediverse_media_handoff_clicked'
		);
		expect( clickedCalls ).toHaveLength( 1 );
		expect( clickedCalls[ 0 ][ 1 ] ).toEqual( {
			connection_id: 1,
			mode_kind: 'standalone',
		} );
	} );
} );

describe( 'useFediverseComposerMedia — slot defaults', () => {
	it( 'returns trivial values for the non-trigger slot fields (no in-pane media state)', () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			useEffect( () => {
				if ( ! composer!.mode ) {
					composer!.openComposer( { kind: 'standalone', entry_point: 'fab' } );
				}
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [] );
			return null;
		}

		renderWithProvider(
			<ComposerProvider connectionId={ 1 } config={ configWithFediverseMedia }>
				<Probe />
			</ComposerProvider>,
			{ queryClient }
		);

		const slot = composer!.mediaSlot;
		expect( slot.hasAny ).toBe( false );
		expect( slot.hasUploaded ).toBe( false );
		// `isAllUploaded` MUST be true (vacuously) so the modal's submit gate
		// `isAllUploaded && ! isAnyPending` stays satisfied with no images.
		expect( slot.isAllUploaded ).toBe( true );
		expect( slot.isAnyPending ).toBe( false );
		expect( slot.renderGrid() ).toBeNull();
		expect( slot.extendBuildParams( { foo: 1 } ) ).toEqual( { foo: 1 } );
		// `onPublishSuccess` / `clear` are side-effect-free no-ops.
		expect( () => slot.onPublishSuccess( queryClient, { uri: 'x' } ) ).not.toThrow();
		expect( () => slot.clear( { keepPreviewUrlsAlive: false } ) ).not.toThrow();
	} );

	it( 'resets hasRequestedMediaHandoff when the modal is closed and reopened', async () => {
		const user = userEvent.setup();
		const { getComposer } = renderTrigger();

		const button = screen.getByRole( 'button', { name: /add media/i } );
		await user.click( button );
		expect( getComposer().hasRequestedMediaHandoff ).toBe( true );

		act( () => getComposer().closeComposer() );
		act( () => getComposer().openComposer( { kind: 'standalone', entry_point: 'fab' } ) );

		expect( getComposer().hasRequestedMediaHandoff ).toBe( false );
	} );
} );
