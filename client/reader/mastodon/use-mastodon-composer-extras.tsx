import { Icon, globe, unlock, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { ComposerExtrasPill, useVisibilityCwState } from 'calypso/reader/social/composer';
import { MastodonComposerControls } from './composer-controls';
import type { MastodonCreatePostMutationParams, MastodonVisibility } from '@automattic/api-core';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';

function storageKeyForConnection( connectionId: number ): string {
	return `calypso_reader_mastodon_composer_visibility_v1:${ connectionId }`;
}

function isMastodonVisibility( value: unknown ): value is MastodonVisibility {
	return value === 'public' || value === 'unlisted' || value === 'private';
}

function visibilityIcon( visibility: MastodonVisibility ) {
	if ( visibility === 'private' ) {
		return <Icon icon={ lock } size={ 16 } />;
	}
	if ( visibility === 'unlisted' ) {
		return <Icon icon={ unlock } size={ 16 } />;
	}
	return <Icon icon={ globe } size={ 16 } />;
}

function visibilityLabel(
	visibility: MastodonVisibility,
	translate: ReturnType< typeof useTranslate >
): string {
	if ( visibility === 'private' ) {
		return String( translate( 'Followers only' ) );
	}
	if ( visibility === 'unlisted' ) {
		return String( translate( 'Quiet public' ) );
	}
	return String( translate( 'Public' ) );
}

function pillLabel(
	visibility: MastodonVisibility,
	cwEnabled: boolean,
	translate: ReturnType< typeof useTranslate >
): string {
	const base = visibilityLabel( visibility, translate );
	if ( ! cwEnabled ) {
		return base;
	}
	return String(
		translate( '%(visibility)s, content warning', {
			args: { visibility: base },
			comment:
				'Composer footer pill label when a Mastodon content warning is enabled. %(visibility)s is the visibility scope, e.g. "Public" or "Followers only".',
		} )
	);
}

/**
 * Per-Mastodon-connection composer-extras hook. Wires the shared
 * `useVisibilityCwState` + `<MastodonComposerControls>` into the
 * `ComposerProtocolExtrasSlot` contract and projects the state into
 * the Mastodon wire payload (`visibility` + `spoiler_text`) via
 * `extendBuildParams`.
 *
 * Controls are surfaced via a footer pill (`renderTrigger`) that
 * opens a popover hosting the visibility radios, the CW toggle, and
 * the CW summary input. The pill's icon + label reflect the current
 * visibility (globe / unlock / lock + "Public" / "Quiet public" /
 * "Followers only"). Standalone-only — replies inherit the parent's
 * visibility on Mastodon, so `renderTrigger` returns `null` for
 * non-standalone modes (parity with the atmosphere extras slot).
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
	const translate = useTranslate();

	const { visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary, clear } =
		useVisibilityCwState< MastodonVisibility >( {
			mode,
			connectionId,
			defaultVisibility: 'public',
			isValidVisibility: isMastodonVisibility,
			storageKey: storageKeyForConnection,
		} );

	const renderTrigger = useCallback( () => {
		if ( mode?.kind !== 'standalone' ) {
			return null;
		}
		return (
			<ComposerExtrasPill
				icon={ visibilityIcon( visibility ) }
				label={ pillLabel( visibility, cwEnabled, translate ) }
				ariaLabel={ String( translate( 'Post visibility and content warning' ) ) }
				popoverContent={ ( { onClose, headingId } ) => (
					<MastodonComposerControls
						headingId={ headingId }
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
						onSave={ onClose }
					/>
				) }
			/>
		);
	}, [ mode, visibility, setVisibility, cwEnabled, setCwEnabled, summary, setSummary, translate ] );

	const extendBuildParams = useCallback(
		( params: unknown ): unknown => {
			const base = params as MastodonCreatePostMutationParams;
			// Replies/quotes inherit the parent's visibility upstream; only
			// stamp our locally-tracked visibility + CW on standalone posts so
			// a stale localStorage pick doesn't leak into a reply payload.
			if ( mode?.kind !== 'standalone' ) {
				return base;
			}
			const next: MastodonCreatePostMutationParams = {
				...base,
				visibility,
			};
			if ( cwEnabled && summary.trim().length > 0 ) {
				next.spoiler_text = summary;
			}
			return next;
		},
		[ mode, visibility, cwEnabled, summary ]
	);

	return { renderControls: () => null, renderTrigger, extendBuildParams, clear };
}
