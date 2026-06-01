/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useAtmosphereInteractionSettings } from '../use-atmosphere-interaction-settings';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';

// The `_changed` Tracks dispatch in `onSave` selects from `state.reader.follows`,
// which the default test store doesn't initialize. We don't assert on the
// Tracks payload here — those are covered by the analytics action's own
// tests — so neutralize the action creator.
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'NOOP' } ) ),
} ) );

const STANDALONE_MODE: ActiveMode = {
	kind: 'standalone',
	connectionId: 7,
	entry_point: 'fab',
};

const REPLY_MODE = {
	kind: 'reply',
	connectionId: 7,
	root: { uri: 'at://root', cid: 'cid' },
	parent: { uri: 'at://parent', cid: 'cid' },
	previewPost: { author: { handle: 'a.bsky.social' } },
} as unknown as ActiveMode;

/**
 * Renders the hook's trigger AND captures the live slot in a ref so tests can
 * call `extendBuildParams` / `getTracksProps` / `clear` post-interaction
 * without coordinating two separate renders. Mirrors the Mastodon test
 * harness.
 */
function Harness( {
	mode,
	slotRef,
}: {
	mode: ActiveMode | null;
	slotRef: { current: ComposerProtocolExtrasSlot | null };
} ) {
	const slot = useAtmosphereInteractionSettings( { mode, connectionId: 7 } );
	slotRef.current = slot;
	return <>{ slot.renderTrigger?.() }</>;
}

function renderHarness( mode: ActiveMode | null = STANDALONE_MODE ) {
	const slotRef: { current: ComposerProtocolExtrasSlot | null } = { current: null };
	const utils = renderWithProvider( <Harness mode={ mode } slotRef={ slotRef } /> );
	return { slotRef, ...utils };
}

async function openPopover( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( screen.getByRole( 'button', { name: /^Post interaction settings/ } ) );
}

describe( 'useAtmosphereInteractionSettings', () => {
	it( 'returns null trigger for non-standalone modes', () => {
		const { slotRef } = renderHarness( REPLY_MODE );
		expect( slotRef.current!.renderTrigger!() ).toBeNull();
	} );

	it( 'returns a non-null trigger for standalone mode', () => {
		const { slotRef } = renderHarness();
		expect( slotRef.current!.renderTrigger!() ).not.toBeNull();
	} );

	it( 'extendBuildParams adds nothing when state is default', () => {
		const { slotRef } = renderHarness();
		const out = slotRef.current!.extendBuildParams( { connectionId: 7, text: 'Hi' } );
		expect( out ).toEqual( { connectionId: 7, text: 'Hi' } );
	} );

	it( 'extendBuildParams adds nothing when mode is reply', () => {
		const { slotRef } = renderHarness( REPLY_MODE );
		const out = slotRef.current!.extendBuildParams( { connectionId: 7, text: 'Hi' } );
		expect( out ).toEqual( { connectionId: 7, text: 'Hi' } );
	} );

	it( 'extendBuildParams adds interaction_settings after picking Nobody and disabling quotes', async () => {
		const user = userEvent.setup();
		const { slotRef } = renderHarness();

		await openPopover( user );
		await user.click( screen.getByRole( 'radio', { name: 'Nobody' } ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Allow quote posts' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( slotRef.current!.extendBuildParams( { connectionId: 7, text: 'Hi' } ) ).toEqual( {
			connectionId: 7,
			text: 'Hi',
			interaction_settings: {
				reply_allow: { kind: 'nobody' },
				allow_quotes: false,
			},
		} );
	} );

	it( 'clear() resets state to defaults', async () => {
		const user = userEvent.setup();
		const { slotRef } = renderHarness();

		await openPopover( user );
		await user.click( screen.getByRole( 'radio', { name: 'Nobody' } ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Allow quote posts' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		act( () => {
			slotRef.current!.clear?.();
		} );

		expect( slotRef.current!.extendBuildParams( { connectionId: 7, text: 'Hi' } ) ).toEqual( {
			connectionId: 7,
			text: 'Hi',
		} );
	} );

	it( 'getTracksProps reflects current non-default state', async () => {
		const user = userEvent.setup();
		const { slotRef } = renderHarness();
		expect( slotRef.current!.getTracksProps?.() ).toEqual( {} );

		await openPopover( user );
		await user.click( screen.getByRole( 'radio', { name: 'Nobody' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( slotRef.current!.getTracksProps?.() ).toEqual( { reply_allow_kind: 'nobody' } );
	} );

	it( 'getTracksProps returns {} for non-standalone mode even with non-default state', async () => {
		const user = userEvent.setup();
		// Mount standalone first so we can flip state via the popover, then
		// re-mount in reply mode to exercise the gating in getTracksProps.
		const { slotRef, rerender } = renderHarness();

		await openPopover( user );
		await user.click( screen.getByRole( 'radio', { name: 'Nobody' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		rerender( <Harness mode={ REPLY_MODE } slotRef={ slotRef } /> );

		expect( slotRef.current!.getTracksProps?.() ).toEqual( {} );
	} );
} );
