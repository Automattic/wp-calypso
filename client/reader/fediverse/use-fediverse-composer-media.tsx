/**
 * Fediverse implementation of the shared `ComposerMediaSlot`. The wire
 * layer (blog-level ActivityPub C2S) exposes inbox/outbox for posts but
 * no media-upload endpoint yet (CM-726), so the slot can't run an
 * in-pane upload flow the way atmosphere / mastodon do. Instead it
 * renders a footer-start media trigger whose visual shape is identical
 * to atmosphere's "Add media" button — same icon, same
 * `social-composer__media` class, same `aria-label` — but clicking it
 * doesn't open a file picker. It flips the provider's
 * `markMediaHandoffRequested` flag, which surfaces the existing
 * `<ComposerOverflowHandoff>` section (with media-flavoured copy) so
 * the user has a clear path to the block editor on the connection's
 * blog. The published post still federates over AP from that blog, so
 * the destination is unchanged; the editor is just where the
 * media-aware flow lives until a C2S media endpoint ships.
 *
 * When that endpoint lands, swap this hook for an in-pane upload hook
 * (mirroring `useAtmosphereComposerMedia` / `useMastodonComposerMedia`)
 * — the slot contract is the same.
 */

import { Icon, image as imageIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useComposer } from 'calypso/reader/social/composer';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { ActiveMode, ComposerMediaSlot } from 'calypso/reader/social/composer';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface Ctx {
	mode: ActiveMode | null;
	connectionId: number;
}

export function useFediverseComposerMedia( { mode, connectionId }: Ctx ): ComposerMediaSlot {
	const renderFooterTrigger = useCallback(
		() => <FediverseMediaTrigger connectionId={ connectionId } modeKind={ mode?.kind ?? null } />,
		[ connectionId, mode?.kind ]
	);

	return useMemo(
		() => ( {
			// No in-pane media state today — every flag is the trivial answer
			// so the modal's submit gate (`isAllUploaded && ! isAnyPending`)
			// stays satisfied and image-only / pending-media branches never
			// fire. `extendBuildParams` is the identity; the wire mutation
			// receives params unchanged.
			hasAny: false,
			hasUploaded: false,
			isAllUploaded: true,
			isAnyPending: false,
			renderGrid: () => null,
			renderFooterTrigger,
			extendBuildParams: ( params ) => params,
			onPublishSuccess: () => undefined,
			clear: () => undefined,
		} ),
		[ renderFooterTrigger ]
	);
}

interface TriggerProps {
	connectionId: number;
	modeKind: ActiveMode[ 'kind' ] | null;
}

/**
 * Footer-start trigger. Visually identical to atmosphere's trigger; the
 * only difference is the `onClick` — instead of opening a file picker,
 * it flips the provider's `markMediaHandoffRequested` flag so the
 * existing `<ComposerOverflowHandoff>` section surfaces the
 * media-flavoured "Move to editor" CTA. Lives as a sub-component so it
 * can call `useComposer()` — the parent hook runs inside the provider
 * before context is established and can't read it directly.
 */
function FediverseMediaTrigger( { connectionId, modeKind }: TriggerProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { markMediaHandoffRequested } = useComposer();

	const handleClick = () => {
		// Surface the section first, then fire telemetry. The order matters:
		// `recordReaderTracksEvent` is a thunk that reads the follows query cache
		// and can throw on a malformed store (seen in tests + on cold caches);
		// the primary user-facing effect must not depend on its success.
		markMediaHandoffRequested();
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_fediverse_media_handoff_clicked', {
				connection_id: connectionId,
				mode_kind: modeKind,
			} )
		);
	};

	return (
		<button
			type="button"
			className="social-composer__media"
			aria-label={ translate( 'Add media' ) as string }
			onClick={ handleClick }
		>
			<Icon icon={ imageIcon } size={ 18 } />
		</button>
	);
}
