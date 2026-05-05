import { createContext, useContext } from 'react';
import type { ActiveMode, ComposerMode } from './composer-provider';
import type { QueryClient, MutationOptions } from '@tanstack/react-query';
import type { I18N } from 'i18n-calypso';
import type { ReactNode } from 'react';

type Translate = ReturnType< I18N[ 'translate' ] > extends infer R
	? ( ...args: Parameters< I18N[ 'translate' ] > ) => R
	: never;

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
	 * `client/reader/AGENTS.md` for the rationale.
	 */
	mutationFactory: ( queryClient: QueryClient ) => MutationOptions< TResult, TError, TParams >;
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
