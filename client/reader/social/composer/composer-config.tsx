import { createContext, useContext } from 'react';
import type { ActiveMode, ComposerMode } from './composer-provider';
import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

/**
 * Optional media-attachment slot exposed by per-protocol configs. The shared
 * provider calls `useMedia` (when defined) at provider mount so the underlying
 * upload state survives modal mount/unmount — the same lifetime that owns the
 * deferred preview-URL revocation. The modal reads the returned slot to render
 * the media UI, gate submission, extend the wire params, and patch the cache
 * with a local-preview embed on publish success.
 *
 * The returned slot is opaque to the modal: per-protocol implementations cast
 * `params` and `result` to their concrete shapes inside `extendBuildParams` /
 * `onPublishSuccess`. Atmosphere wires it via `useAtmosphereComposerMedia`;
 * Mastodon wires it via `useMastodonComposerMedia` (CM-676). The shared
 * `<MediaGrid>` / `<AltTextPopover>` primitives live in
 * `client/reader/social/composer-media/`; per-protocol shells supply upload
 * state and predicates at the call site.
 */
export interface ComposerMediaSlot {
	/** True when at least one image entry exists (any kind). Used by the modal's discard guard. */
	hasAny: boolean;
	/** True when at least one image is in the `'uploaded'` state. Lets image-only posts submit. */
	hasUploaded: boolean;
	/** True when every image entry is `'uploaded'`. Submit is gated on this. */
	isAllUploaded: boolean;
	/** True when at least one image is still compressing or uploading. Submit is gated against this. */
	isAnyPending: boolean;
	/**
	 * Renders the grid of attached items (e.g. atmosphere's `<ImageGrid>`).
	 * Slotted under the textarea, above the error region. Returns `null`
	 * when nothing should appear.
	 */
	renderGrid: () => ReactNode;
	/**
	 * Renders the media trigger button on the left side of the footer
	 * (e.g. atmosphere's "Add image" picker). The slot owns the hidden
	 * `<input type="file">` so the shared footer doesn't have to know
	 * accepted file types or per-protocol upload limits. Returns `null`
	 * when no trigger should appear.
	 */
	renderFooterTrigger: () => ReactNode;
	/**
	 * Merge wire-level media fields into the protocol's params before the
	 * mutation runs. The modal calls `config.buildParams(mode, text)` first,
	 * then passes the result through this hook for the media-aware variant.
	 * `unknown` keeps the slot opaque — per-protocol implementations cast.
	 *
	 * Returning a Promise lets a per-protocol slot defer wire work (e.g.
	 * uploading staged media) until publish time. The modal awaits the
	 * result before invoking the mutation. Atmosphere returns synchronously;
	 * Mastodon returns a Promise that resolves with `media_ids` populated.
	 */
	extendBuildParams: ( params: unknown ) => unknown | Promise< unknown >;
	/**
	 * Called from the modal's `onSuccess` after the wire write succeeds.
	 * Atmosphere uses this to patch the just-published item's cache embed
	 * with local preview URLs so the UI shows the user's images during the
	 * brief window before the next refetch. `result` is opaque — the
	 * implementation casts to its protocol's result shape.
	 */
	onPublishSuccess: ( queryClient: QueryClient, result: unknown ) => void;
	/**
	 * Drop all media state. Called by the provider when `mode` transitions
	 * to `null`. `keepPreviewUrlsAlive` is true on the publish-success path
	 * (atmosphere defers revocation by ~60s so cache entries that reference
	 * local preview URLs outlast the timeline staleTime) and false on the
	 * cancel/discard path (URLs reclaimed immediately).
	 */
	clear: ( options: { keepPreviewUrlsAlive: boolean } ) => void;
}

/**
 * The translate function from `useTranslate()` — has overloads for 1/2/3
 * args. Re-export so per-protocol configs can refer to the same shape
 * without each redeclaring it. Capturing it via `useTranslate` (a hook)
 * is intentional: `i18n-calypso`'s `I18N['translate']` type drops the
 * overload set down to just the most-args signature, which would force
 * `t( 'string' )` calls to fail typechecking.
 */
export type Translate = ReturnType< typeof useTranslate >;

/**
 * Per-protocol configuration injected into `<ComposerProvider>` to drive the
 * generic `<ComposerModal>`. Each protocol (atmosphere, mastodon, …) supplies
 * its own config: which mode kinds it supports, the wire mutation, the error
 * map, the Tracks event names, the title/placeholder copy, and the success
 * notice.
 */
export interface ComposerConfig< TError, TParams, TResult > {
	/** Maximum graphemes the composer will accept. */
	limit: number;
	/**
	 * Mode kinds this protocol supports. Atmosphere supports all three;
	 * Mastodon supports `'reply' | 'standalone'` (no native quote concept).
	 * The modal renders nothing when an unsupported mode is opened.
	 */
	supportedModes: ReadonlyArray< ComposerMode[ 'kind' ] >;
	/**
	 * Mutation factory accepting the consumer's QueryClient — Calypso boots
	 * its own client separate from the api-queries singleton. See
	 * `client/reader/AGENTS.md` for the rationale. The mutation context is
	 * intentionally widened to `unknown` so per-protocol factories can carry
	 * their own onMutate snapshot shapes (atmosphere's `CreatePostContext`,
	 * mastodon's optimistic snapshots) without leaking that shape into the
	 * generic config.
	 */
	mutationFactory: ( queryClient: QueryClient ) => Omit<
		// `any` for TContext is intentional: per-protocol factories carry
		// their own onMutate snapshot shape (atmosphere's CreatePostContext,
		// mastodon's optimistic snapshots) and the modal never reads the
		// context. `UseMutationOptions` is invariant in TContext, so a
		// concrete shape can't be widened to `unknown`/`void` without
		// triggering TS2322 — `any` is the right escape hatch here.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		UseMutationOptions< TResult, TError, TParams, any >,
		'mutationKey'
	>;
	/** Build the wire params from the active mode and the composed text. */
	buildParams: ( mode: ActiveMode, text: string ) => TParams;
	/**
	 * Per-error-kind copy. Returns ReactNode so the reconnect URL can be
	 * embedded as `<a>` via i18n's component interpolation.
	 */
	errorMessage: ( error: TError, translate: Translate ) => ReactNode;
	/** Success-notice text + optional in-app thread URL for the "View" button. */
	successNotice: (
		mode: ActiveMode,
		result: TResult,
		translate: Translate
	) => { text: ReactNode; threadUrl: string | null };
	/**
	 * Tracks event names + properties for the lifecycle hooks. The modal
	 * dispatches via Redux (`recordReaderTracksEvent`) — the config supplies
	 * names and per-mode property bags so the prefix and shape stay
	 * protocol-specific.
	 */
	tracks: {
		opened: ( mode: ActiveMode ) => { event: string; props: Record< string, unknown > };
		published: (
			mode: ActiveMode,
			result: TResult
		) => { event: string; props: Record< string, unknown > };
		errorShown: (
			mode: ActiveMode,
			error: TError
		) => { event: string; props: Record< string, unknown > };
	};
	/** Per-mode title and placeholder copy. */
	copy: {
		title: ( mode: ActiveMode, translate: Translate ) => string;
		placeholder: ( mode: ActiveMode, translate: Translate, handle?: string ) => string;
	};
	/**
	 * Optional hook for a `bad_request` body-logging path. Atmosphere logs the
	 * raw response code so the error-copy classifier can be tuned with real
	 * production data; Mastodon may want the same. Returns nothing — fire and
	 * forget. Keep this out of the type if a protocol doesn't need it.
	 */
	logBadRequest?: ( mode: ActiveMode, error: TError ) => void;
	/**
	 * Optional media-slot hook. Called once at provider mount with the live
	 * mode + connection id (the slot reads `mode.kind` for analytics labels,
	 * and `connectionId` for the upload endpoint). The hook MUST be a stable
	 * reference across renders — it's invoked unconditionally inside the
	 * provider so React's hook-ordering rules apply. Atmosphere supplies
	 * `useAtmosphereComposerMedia`; Mastodon supplies
	 * `useMastodonComposerMedia` (CM-676).
	 */
	useMedia?: ( ctx: { mode: ActiveMode | null; connectionId: number } ) => ComposerMediaSlot;
}

/**
 * The config is supplied at provider mount and read by the modal. Holding
 * it in its own context (rather than a prop drilled through every helper)
 * keeps `<ComposerModal>` props lean and lets per-protocol shells inject
 * the config once at the panel boundary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComposerConfigContext = createContext< ComposerConfig< any, any, any > | null >( null );

export const ComposerConfigProvider = ComposerConfigContext.Provider;

export function useComposerConfig< TError, TParams, TResult >(): ComposerConfig<
	TError,
	TParams,
	TResult
> {
	const config = useContext( ComposerConfigContext );
	if ( ! config ) {
		throw new Error( 'useComposerConfig must be called inside <ComposerProvider>' );
	}
	return config as ComposerConfig< TError, TParams, TResult >;
}
