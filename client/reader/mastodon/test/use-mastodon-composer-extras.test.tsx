/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHookWithProvider, renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useMastodonComposerExtras } from '../use-mastodon-composer-extras';
import type { MastodonCreatePostMutationParams } from '@automattic/api-core';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	entry_point: 'fab',
	connectionId: 7,
};

beforeEach( () => {
	window.localStorage.clear();
} );

/**
 * Renders the hook's trigger AND captures the live slot in a ref, so tests
 * can call `extendBuildParams` post-interaction without coordinating two
 * separate renders.
 */
function Harness( {
	mode = standaloneMode,
	slotRef,
}: {
	mode?: ActiveMode | null;
	slotRef: { current: ComposerProtocolExtrasSlot | null };
} ) {
	const slot = useMastodonComposerExtras( { mode, connectionId: 7 } );
	slotRef.current = slot;
	return <>{ slot.renderTrigger?.() }</>;
}

function renderHarness( mode: ActiveMode | null = standaloneMode ) {
	const slotRef: { current: ComposerProtocolExtrasSlot | null } = { current: null };
	const utils = renderWithProvider( <Harness mode={ mode } slotRef={ slotRef } /> );
	return { slotRef, ...utils };
}

describe( 'useMastodonComposerExtras — extendBuildParams visibility + CW merge', () => {
	it( 'defaults visibility to `public` when no localStorage pick is set', () => {
		const { slotRef } = renderHarness();

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'public' );
	} );

	it( 'adopts a valid localStorage visibility (`private`) on open', () => {
		// Mastodon's wire value for "followers only" is `'private'` — the
		// localStorage shape stays consistent with the wire enum, not the
		// visible label.
		window.localStorage.setItem( 'calypso_reader_mastodon_composer_visibility_v1:7', 'private' );
		const { slotRef } = renderHarness();

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'private' );
	} );

	it( 'ignores an unknown localStorage value and falls back to the default', () => {
		// Guard against the localStorage key being mutated by another tab /
		// older version of the app — `'direct'` is not in this composer's
		// supported set, so the hook must reject it and fall back rather
		// than ship an unsupported wire value.
		window.localStorage.setItem( 'calypso_reader_mastodon_composer_visibility_v1:7', 'direct' );
		const { slotRef } = renderHarness();

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'public' );
	} );

	it( 'maps the CW summary onto the wire `spoiler_text` field when enabled', async () => {
		const user = userEvent.setup();
		const { slotRef } = renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Add content warning' } ) );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Content warning summary' } ),
			'spoilers ahead'
		);

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.spoiler_text ).toBe( 'spoilers ahead' );
	} );

	it( 'omits `spoiler_text` when CW is enabled but the summary is empty / whitespace', async () => {
		const user = userEvent.setup();
		const { slotRef } = renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Add content warning' } ) );
		await user.type( screen.getByRole( 'textbox', { name: 'Content warning summary' } ), '   ' );

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( 'spoiler_text' in merged ).toBe( false );
	} );

	it( 'leaves params untouched for non-standalone modes so replies inherit the parent visibility', () => {
		// Even when localStorage carries a non-default visibility from a
		// prior standalone session, replies must not stamp it onto the wire
		// (the UI is hidden for replies, so the user has no affordance to
		// change it — the upstream API inherits the parent visibility when
		// `visibility` is omitted).
		window.localStorage.setItem( 'calypso_reader_mastodon_composer_visibility_v1:7', 'private' );
		const replyMode = {
			kind: 'reply',
			connectionId: 7,
			root: { uri: 'tag:mastodon/1' },
			parent: { uri: 'tag:mastodon/1' },
		} as unknown as ActiveMode;
		const { slotRef } = renderHarness( replyMode );

		const base: MastodonCreatePostMutationParams = { connectionId: 7, status: 'hi' };
		const merged = slotRef.current!.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged ).toEqual( base );
		expect( 'visibility' in merged ).toBe( false );
		expect( 'spoiler_text' in merged ).toBe( false );
	} );

	it( 'persists the user’s visibility pick to localStorage', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'radio', { name: 'Followers only' } ) );

		expect(
			window.localStorage.getItem( 'calypso_reader_mastodon_composer_visibility_v1:7' )
		).toBe( 'private' );
	} );
} );

describe( 'useMastodonComposerExtras — footer pill rendering', () => {
	it( 'returns null trigger for non-standalone modes', () => {
		const replyMode = {
			kind: 'reply',
			connectionId: 7,
			root: { uri: 'tag:mastodon/1' },
			parent: { uri: 'tag:mastodon/1' },
		} as unknown as ActiveMode;
		const { result } = renderHookWithProvider( () =>
			useMastodonComposerExtras( { mode: replyMode, connectionId: 7 } )
		);
		expect( result.current.renderTrigger!() ).toBeNull();
	} );

	it( 'pill label reflects current visibility (public default)', () => {
		renderHarness();
		expect(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		).toHaveTextContent( 'Public' );
	} );

	it( 'pill label reflects current visibility (private after pick)', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'radio', { name: 'Followers only' } ) );
		// Close the popover to assert the label updates on the trigger.
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect(
				screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
			).toHaveTextContent( 'Followers only' );
		} );
	} );

	it( 'opens the popover from the footer pill and exposes the visibility radios', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);

		expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Quiet public' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Followers only' } ) ).not.toBeChecked();
	} );

	it( 'moves focus to the CW summary textarea when CW toggles on inside the popover', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Add content warning' } ) );

		await waitFor( () => {
			expect( screen.getByRole( 'textbox', { name: 'Content warning summary' } ) ).toHaveFocus();
		} );
	} );

	it( 'pill label appends the content-warning state when CW is enabled', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Add content warning' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect(
				screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
			).toHaveTextContent( 'Public, content warning' );
		} );
	} );

	it( 'Save button closes the popover', async () => {
		const user = userEvent.setup();
		renderHarness();

		await user.click(
			screen.getByRole( 'button', { name: /^Post visibility and content warning/ } )
		);
		expect( screen.getByRole( 'radio', { name: 'Public' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );
		await waitFor( () => {
			expect( screen.queryByRole( 'radio', { name: 'Public' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
