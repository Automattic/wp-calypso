import { createContext, useContext } from 'react';
import type { SocialPost } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

export interface LikeAction {
	/**
	 * True when a per-protocol adapter is mounted via LikeProvider;
	 * false when no provider is present (null-action default).
	 */
	supported: boolean;
	isLiked: boolean;
	isPending: boolean;
	label: {
		/** Accessible label with count — e.g. "Like, 5 likes". */
		accessibleLabel: ( count: number ) => TranslateResult;
		/**
		 * Full stat-row phrase, plural-aware — e.g. "<strong>5</strong> likes" /
		 * "<strong>1</strong> favorite". Adapter owns the singular/plural form
		 * AND the `%(count)s` placeholder so translators see the whole sentence
		 * and control count/noun ordering.
		 */
		statRowText: ( count: number ) => TranslateResult;
	};
	like: () => void;
	unlike: () => void;
}

export type UseLikeActionFn = ( post: SocialPost ) => LikeAction;

/**
 * The null-action default: no provider mounted; all interactions are no-ops.
 * The button renders a static-count fallback when `supported === false`.
 */
const nullLikeActionFn: UseLikeActionFn = () => ( {
	supported: false,
	isLiked: false,
	isPending: false,
	label: {
		accessibleLabel: () => '',
		statRowText: () => '',
	},
	like: () => {},
	unlike: () => {},
} );

export const LikeContext = createContext< UseLikeActionFn >( nullLikeActionFn );

/**
 * Provider alias — wrap a subtree with a per-protocol adapter function.
 * @example
 * <LikeProvider value={ useAtmosphereLikeAction }>
 *   { children }
 * </LikeProvider>
 */
export const LikeProvider = LikeContext.Provider;

/**
 * Hook: returns the like action for a given post by calling the
 * per-protocol adapter function injected via LikeProvider.
 *
 * Must be called inside a component — the adapter fn is itself a custom hook,
 * so the wrapping call site must also follow rules-of-hooks.
 */
export function useLikeAction( post: SocialPost ): LikeAction {
	const adapterFn = useContext( LikeContext );
	return adapterFn( post );
}
