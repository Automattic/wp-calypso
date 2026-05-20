import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	ComposerConfigProvider,
	type ComposerConfig,
	type ComposerMediaSlot,
	type ComposerProtocolExtrasSlot,
} from './composer-config';
import type { ReactNode } from 'react';

/**
 * Default `ComposerMediaSlot` returned when a config doesn't supply
 * `useMedia`. All flags are `false`, render is a no-op, and the param /
 * success hooks are pass-through identities. Calling this from the
 * provider's `useMemo` keeps the context value referentially stable for
 * configs without media support.
 */
const NOOP_MEDIA_SLOT: ComposerMediaSlot = {
	hasAny: false,
	hasUploaded: false,
	isAllUploaded: true,
	isAnyPending: false,
	renderGrid: () => null,
	renderFooterTrigger: () => null,
	extendBuildParams: ( params ) => params,
	onPublishSuccess: () => undefined,
	clear: () => undefined,
};

function useNoopMedia(): ComposerMediaSlot {
	return NOOP_MEDIA_SLOT;
}

/**
 * Default `ComposerProtocolExtrasSlot` returned when a config doesn't
 * supply `useProtocolExtras`. Render is null; the param hook is the
 * identity. Atmosphere / Mastodon configs leave the slot undefined and
 * fall through to this.
 */
const NOOP_EXTRAS_SLOT: ComposerProtocolExtrasSlot = {
	renderControls: () => null,
	extendBuildParams: ( params ) => params,
	clear: () => undefined,
};

function useNoopProtocolExtras(): ComposerProtocolExtrasSlot {
	return NOOP_EXTRAS_SLOT;
}

/**
 * Generic strong-ref for the post being replied to / quoted. Atmosphere
 * supplies `{ uri, cid }` (AT-Proto strong-ref). Mastodon supplies
 * `{ uri }` where `uri` is the instance-local status id — `cid` is
 * unused. The generic shape lets the composer pass a parent reference
 * through to a per-protocol `buildParams` mapper without leaking
 * AT-Proto-specific terminology into the shared layer.
 */
export interface ComposerParentRef {
	uri: string;
	cid?: string;
}

/**
 * Structural shape consumed by `<ComposerPinnedContext>`. Both
 * per-protocol feed items and the shared `SocialPost` shape satisfy
 * this — the pinned preview only reads four fields plus the post
 * identity. Keeping it structural means callers can pass a `SocialPost`
 * directly without re-deriving a protocol-specific item.
 */
export interface PreviewPost {
	uri: string;
	cid?: string;
	permalink?: string;
	text: string;
	html: string;
	author: {
		handle: string;
		display_name: string;
	};
}

/**
 * Analytics dimension carried on the standalone variant of `ComposerMode`.
 * Populates the `entry_point` Tracks property on `_compose_opened`.
 */
export type ComposerEntryPoint = 'timeline_inline' | 'profile_inline' | 'fab';

export type ComposerMode =
	| {
			kind: 'reply';
			root: ComposerParentRef;
			parent: ComposerParentRef;
			previewPost: PreviewPost;
	  }
	| {
			kind: 'quote';
			quote: ComposerParentRef;
			previewPost: PreviewPost;
			replyTo?: { root: ComposerParentRef; parent: ComposerParentRef };
	  }
	| { kind: 'standalone'; entry_point: ComposerEntryPoint };

export type ActiveMode = ComposerMode & { connectionId: number };

/**
 * Options accepted by `closeComposer`. The deferred-revocation flag is the
 * only knob today: success paths that patched cache entries with local
 * preview URLs (atmosphere's `setAtmospherePostEmbed`) pass `true` so the
 * URLs survive past the timeline / author-feed staleTime; cancel and
 * discard paths leave it `false` so URLs are reclaimed immediately.
 */
export interface CloseComposerOptions {
	keepPreviewUrlsAlive?: boolean;
}

interface ComposerContextValue {
	mode: ActiveMode | null;
	openComposer: ( mode: ComposerMode ) => void;
	closeComposer: ( options?: CloseComposerOptions ) => void;
	/** Read by the modal to render media UI and gate submission. */
	mediaSlot: ComposerMediaSlot;
	/** Read by the modal to render protocol-specific controls. */
	protocolExtrasSlot: ComposerProtocolExtrasSlot;
	/**
	 * Sticky-once flag: true after the user has crossed the per-protocol
	 * char limit at least once during the current modal session. Reset on
	 * each modal open. Stays true once tripped so the overflow-handoff UI
	 * doesn't disappear when the user trims back under the limit, which
	 * would otherwise hide the escape hatch they're working toward.
	 */
	hasBeenOverLimit: boolean;
	markOverLimit: () => void;
	/**
	 * Sticky-once flag: true after the user has explicitly asked to hand
	 * off to the block editor for a feature the in-pane composer can't
	 * cover (today: Fediverse media, CM-726 — blog-level ActivityPub C2S
	 * has no media-upload endpoint). The fediverse `useMedia` slot's
	 * footer-start button flips this flag on click; the overflow-handoff
	 * section reuses its existing UI to render the "Move to editor" CTA
	 * with media-flavoured copy. Stays true once tripped so the section
	 * stays visible across re-renders (same lifecycle as `hasBeenOverLimit`).
	 * Reset on each modal open.
	 */
	hasRequestedMediaHandoff: boolean;
	markMediaHandoffRequested: () => void;
}

const ComposerContext = createContext< ComposerContextValue | null >( null );

interface Props< TError, TParams, TResult > {
	connectionId: number;
	config: ComposerConfig< TError, TParams, TResult >;
	children: ReactNode;
}

export function ComposerProvider< TError, TParams, TResult >( {
	connectionId,
	config,
	children,
}: Props< TError, TParams, TResult > ) {
	const [ mode, setMode ] = useState< ActiveMode | null >( null );
	const [ hasBeenOverLimit, setHasBeenOverLimit ] = useState( false );
	const [ hasRequestedMediaHandoff, setHasRequestedMediaHandoff ] = useState( false );
	const triggerRef = useRef< HTMLElement | null >( null );
	const wasOpenRef = useRef( false );

	useEffect( () => {
		if ( mode ) {
			wasOpenRef.current = true;
			return;
		}
		if ( wasOpenRef.current ) {
			wasOpenRef.current = false;
			triggerRef.current?.focus();
		}
	}, [ mode ] );

	const openComposer = useCallback(
		( next: ComposerMode ) => {
			if ( ! config.supportedModes.includes( next.kind ) ) {
				return;
			}
			triggerRef.current = document.activeElement as HTMLElement | null;
			setHasBeenOverLimit( false );
			setHasRequestedMediaHandoff( false );
			setMode( { ...next, connectionId } );
		},
		[ connectionId, config.supportedModes ]
	);

	// Tracks whether the most recent close should keep preview URLs alive.
	// Read inside the `mode → null` effect that calls `mediaSlot.clear`.
	// Stored on a ref because the effect can't take a parameter, and stuffing
	// the flag into `mode` itself would couple it to the open-state model.
	const keepPreviewUrlsAliveRef = useRef( false );

	const closeComposer = useCallback( ( options?: CloseComposerOptions ) => {
		keepPreviewUrlsAliveRef.current = options?.keepPreviewUrlsAlive ?? false;
		setMode( null );
	}, [] );

	const markOverLimit = useCallback( () => {
		setHasBeenOverLimit( true );
	}, [] );

	const markMediaHandoffRequested = useCallback( () => {
		setHasRequestedMediaHandoff( true );
	}, [] );

	// `config.useMedia` is captured once at the start of the provider's life
	// and called every render. Per the contract on `ComposerConfig.useMedia`,
	// it must be a stable reference — atmosphere exports a module-level hook
	// (`useAtmosphereComposerMedia`), and configs without media support fall
	// through to `useNoopMedia`. The hook reads `mode` and `connectionId`
	// each render so the underlying upload state machine (atmosphere's
	// `useImageUploads`) sees live values for analytics + endpoint args.
	const useMedia = config.useMedia ?? useNoopMedia;
	const mediaSlot = useMedia( { mode, connectionId } );

	// Protocol-specific extras slot (visibility selectors, CW toggles, etc.).
	// Same lifetime contract as `useMedia` — invoked unconditionally so React's
	// hook-ordering rules apply, even when no extras are wired.
	const useProtocolExtras = config.useProtocolExtras ?? useNoopProtocolExtras;
	const protocolExtrasSlot = useProtocolExtras( { mode, connectionId } );

	// Reset media state when the composer closes (mode → null). `clear` is
	// driven by the per-protocol slot — atmosphere's implementation calls
	// `useImageUploads.clearAll` with deferred revocation when the publish
	// path requested it.
	useEffect( () => {
		if ( ! mode ) {
			const keepPreviewUrlsAlive = keepPreviewUrlsAliveRef.current;
			keepPreviewUrlsAliveRef.current = false;
			mediaSlot.clear( { keepPreviewUrlsAlive } );
			protocolExtrasSlot.clear?.();
		}
		// `mediaSlot` / `protocolExtrasSlot` are recreated each render —
		// capturing them in deps would re-run the effect every render. The
		// closure reads the snapshot at effect time, which is the desired
		// behavior.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mode ] );

	const value = useMemo(
		() => ( {
			mode,
			openComposer,
			closeComposer,
			mediaSlot,
			protocolExtrasSlot,
			hasBeenOverLimit,
			markOverLimit,
			hasRequestedMediaHandoff,
			markMediaHandoffRequested,
		} ),
		[
			mode,
			openComposer,
			closeComposer,
			mediaSlot,
			protocolExtrasSlot,
			hasBeenOverLimit,
			markOverLimit,
			hasRequestedMediaHandoff,
			markMediaHandoffRequested,
		]
	);

	return (
		<ComposerContext.Provider value={ value }>
			<ComposerConfigProvider value={ config }>{ children }</ComposerConfigProvider>
		</ComposerContext.Provider>
	);
}

export function useComposer(): ComposerContextValue {
	const ctx = useContext( ComposerContext );
	if ( ! ctx ) {
		throw new Error( 'useComposer must be called inside <ComposerProvider>' );
	}
	return ctx;
}

/**
 * Soft variant: returns `null` outside a `<ComposerProvider>` instead of
 * throwing. Use this in components that opt into the composer when one
 * is mounted (e.g. panels rendering post cards) but should still render
 * fine in tests or shells that don't provide a composer.
 */
export function useOptionalComposer(): ComposerContextValue | null {
	return useContext( ComposerContext );
}
