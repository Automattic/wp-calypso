import { createContext, useContext } from 'react';
import type { SocialPost } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

export interface RepostAction {
	/**
	 * True when a per-protocol adapter is mounted via RepostProvider;
	 * false when no provider is present (null-action default).
	 */
	supported: boolean;
	isReposted: boolean;
	isPending: boolean;
	label: {
		/** Short action label rendered in the dropdown menu — e.g. "Repost" / "Boost". */
		action: TranslateResult;
		/**
		 * Accessible label with count — e.g. "Repost, 5 reposts".
		 * Takes the count AND a boolean so the adapter can return either the
		 * "Repost, %d repost(s)" or "Undo repost, %d repost(s)" form.
		 */
		accessibleLabel: ( count: number, isReposted: boolean ) => TranslateResult;
		/**
		 * Full stat-row phrase, plural-aware — e.g. "<strong>5</strong> reposts" /
		 * "<strong>1</strong> boost". Adapter owns the singular/plural form
		 * AND the `%(count)s` placeholder so translators see the whole sentence
		 * and control count/noun ordering.
		 */
		statRowText: ( count: number ) => TranslateResult;
	};
	/** Whether the Quote post action is available (slice-7d follow-up). */
	canQuote: boolean;
	repost: () => void;
	unrepost: () => void;
	/** No-op until slice-7d; adapters set canQuote:false for now. */
	quote: () => void;
}

export type UseRepostActionFn = ( post: SocialPost ) => RepostAction;

/**
 * The null-action default: no provider mounted; all interactions are no-ops.
 * The button renders a static-count fallback when `supported === false`.
 */
const nullRepostActionFn: UseRepostActionFn = () => ( {
	supported: false,
	isReposted: false,
	isPending: false,
	label: {
		action: '',
		accessibleLabel: () => '',
		statRowText: () => '',
	},
	canQuote: false,
	repost: () => {},
	unrepost: () => {},
	quote: () => {},
} );

export const RepostContext = createContext< UseRepostActionFn >( nullRepostActionFn );

/**
 * Provider alias — wrap a subtree with a per-protocol adapter function.
 * @example
 * <RepostProvider value={ useAtmosphereRepostAction }>
 *   { children }
 * </RepostProvider>
 */
export const RepostProvider = RepostContext.Provider;

/**
 * Hook: returns the repost action for a given post by calling the
 * per-protocol adapter function injected via RepostProvider.
 *
 * Must be called inside a component — the adapter fn is itself a custom hook,
 * so the wrapping call site must also follow rules-of-hooks.
 */
export function useRepostAction( post: SocialPost ): RepostAction {
	const adapterFn = useContext( RepostContext );
	return adapterFn( post );
}
