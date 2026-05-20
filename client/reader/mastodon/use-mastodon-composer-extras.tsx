import { useCallback } from 'react';
import { useVisibilityCwState } from 'calypso/reader/social/composer';
import { MastodonComposerControls } from './composer-controls';
import type { MastodonCreatePostMutationParams, MastodonVisibility } from '@automattic/api-core';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';

function storageKeyForConnection( connectionId: number ): string {
	return `calypso_reader_mastodon_composer_visibility_v1:${ connectionId }`;
}

function isMastodonVisibility( value: unknown ): value is MastodonVisibility {
	return value === 'public' || value === 'unlisted' || value === 'private';
}

/**
 * Per-Mastodon-connection composer-extras hook. Wires the shared
 * `useVisibilityCwState` + `<MastodonComposerControls>` into the
 * `ComposerProtocolExtrasSlot` contract and projects the state into
 * the Mastodon wire payload (`visibility` + `spoiler_text`) via
 * `extendBuildParams`.
 *
 * Visibility defaults: the user's last pick (localStorage, keyed on
 * connection id) → `'public'` when no pick exists. Mastodon's
 * connections endpoint doesn't currently surface a per-account
 * default visibility (unlike Fediverse's `default_visibility`), so
 * the bare `'public'` floor is the only fallback. If the upstream
 * `verify_credentials.source.privacy` ever lands on the connection
 * detail shape, thread it through `defaultVisibility` here.
 *
 * Spoiler-text mapping: Mastodon's wire field is `spoiler_text` (not
 * Fediverse's `summary`). The composer-internal state name stays
 * `summary` for shared-hook parity; the wire mapping happens here.
 *
 * Mounted by the provider via `ComposerConfig.useProtocolExtras`. The
 * provider calls `clear()` when the modal closes so state resets
 * between sessions.
 */
export function useMastodonComposerExtras( ctx: {
	mode: ActiveMode | null;
	connectionId: number;
} ): ComposerProtocolExtrasSlot {
	const { connectionId, mode } = ctx;

	const { visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary, clear } =
		useVisibilityCwState< MastodonVisibility >( {
			mode,
			connectionId,
			defaultVisibility: 'public',
			isValidVisibility: isMastodonVisibility,
			storageKey: storageKeyForConnection,
		} );

	const renderControls = useCallback(
		() => (
			<MastodonComposerControls
				visibility={ visibility }
				onVisibilityChange={ setVisibility }
				cwEnabled={ cwEnabled }
				onCwToggle={ ( enabled ) => {
					setCwEnabled( enabled );
					if ( ! enabled ) {
						setSummary( '' );
					}
				} }
				summary={ summary }
				onSummaryChange={ setSummary }
			/>
		),
		[ visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary ]
	);

	const extendBuildParams = useCallback(
		( params: unknown ): unknown => {
			const base = params as MastodonCreatePostMutationParams;
			const next: MastodonCreatePostMutationParams = {
				...base,
				visibility,
			};
			if ( cwEnabled && summary.trim().length > 0 ) {
				next.spoiler_text = summary;
			}
			return next;
		},
		[ visibility, cwEnabled, summary ]
	);

	return { renderControls, extendBuildParams, clear };
}
