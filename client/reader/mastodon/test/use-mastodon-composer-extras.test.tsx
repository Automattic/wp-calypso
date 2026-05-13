/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { useMastodonComposerExtras } from '../use-mastodon-composer-extras';
import type { MastodonCreatePostMutationParams } from '@automattic/api-core';
import type { ActiveMode } from 'calypso/reader/social/composer';

function wrapperFor( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	entry_point: 'fab',
	connectionId: 7,
};

beforeEach( () => {
	window.localStorage.clear();
} );

describe( 'useMastodonComposerExtras — extendBuildParams visibility + CW merge', () => {
	it( 'defaults visibility to `public` when no localStorage pick is set', () => {
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = result.current.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'public' );
	} );

	it( 'adopts a valid localStorage visibility (`private`) on open', () => {
		// Mastodon's wire value for "followers only" is `'private'` — the
		// localStorage shape stays consistent with the wire enum, not the
		// visible label.
		window.localStorage.setItem( 'calypso_reader_mastodon_composer_visibility_v1:7', 'private' );
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = result.current.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'private' );
	} );

	it( 'ignores an unknown localStorage value and falls back to the default', () => {
		// Guard against the localStorage key being mutated by another tab /
		// older version of the app — `'direct'` is not in this composer's
		// supported set, so the hook must reject it and fall back rather
		// than ship an unsupported wire value.
		window.localStorage.setItem( 'calypso_reader_mastodon_composer_visibility_v1:7', 'direct' );
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = result.current.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.visibility ).toBe( 'public' );
	} );

	it( 'maps the CW summary onto the wire `spoiler_text` field when enabled', () => {
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		// Toggle CW on + set summary via the controls element.
		const initial = result.current.renderControls() as React.ReactElement< {
			onCwToggle: ( enabled: boolean ) => void;
			onSummaryChange: ( value: string ) => void;
		} >;
		act( () => {
			initial.props.onCwToggle( true );
		} );
		// After the toggle, re-render to capture the updated controls element.
		const afterToggle = result.current.renderControls() as React.ReactElement< {
			onSummaryChange: ( value: string ) => void;
		} >;
		act( () => {
			afterToggle.props.onSummaryChange( 'spoilers ahead' );
		} );

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = result.current.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( merged.spoiler_text ).toBe( 'spoilers ahead' );
	} );

	it( 'omits `spoiler_text` when CW is enabled but the summary is empty / whitespace', () => {
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const initial = result.current.renderControls() as React.ReactElement< {
			onCwToggle: ( enabled: boolean ) => void;
			onSummaryChange: ( value: string ) => void;
		} >;
		act( () => {
			initial.props.onCwToggle( true );
		} );
		const afterToggle = result.current.renderControls() as React.ReactElement< {
			onSummaryChange: ( value: string ) => void;
		} >;
		act( () => {
			afterToggle.props.onSummaryChange( '   ' );
		} );

		const base: MastodonCreatePostMutationParams = {
			connectionId: 7,
			status: 'hello',
		};
		const merged = result.current.extendBuildParams( base ) as MastodonCreatePostMutationParams;
		expect( 'spoiler_text' in merged ).toBe( false );
	} );

	it( 'persists the user’s visibility pick to localStorage', () => {
		const client = new QueryClient();
		const { result } = renderHook(
			() => useMastodonComposerExtras( { mode: standaloneMode, connectionId: 7 } ),
			{ wrapper: wrapperFor( client ) }
		);

		const element = result.current.renderControls() as React.ReactElement< {
			onVisibilityChange: ( next: string ) => void;
		} >;
		act( () => {
			element.props.onVisibilityChange( 'private' );
		} );

		expect(
			window.localStorage.getItem( 'calypso_reader_mastodon_composer_visibility_v1:7' )
		).toBe( 'private' );
	} );
} );
