import { createContext, useContext } from 'react';
import type { SocialPost } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

export interface FavouriteAction {
	/**
	 * True when a per-protocol adapter is mounted via FavouritesProvider;
	 * false when no provider is present (null-action default).
	 */
	supported: boolean;
	isFavourited: boolean;
	isPending: boolean;
	error: { kind: string } | null;
	label: {
		/** Short action label — e.g. "Like". */
		action: TranslateResult;
		/** Accessible label with count — e.g. "Like, 5 likes". */
		accessibleLabel: ( count: number ) => TranslateResult;
	};
	favourite: () => void;
	unfavourite: () => void;
}

export type UseFavouriteActionFn = ( post: SocialPost ) => FavouriteAction;

/**
 * The null-action default: no provider mounted; all interactions are no-ops.
 * The button renders a static-count fallback when `supported === false`.
 */
const nullFavouriteActionFn: UseFavouriteActionFn = () => ( {
	supported: false,
	isFavourited: false,
	isPending: false,
	error: null,
	label: {
		action: '',
		accessibleLabel: () => '',
	},
	favourite: () => {},
	unfavourite: () => {},
} );

export const FavouritesContext = createContext< UseFavouriteActionFn >( nullFavouriteActionFn );

/**
 * Provider alias — wrap a subtree with a per-protocol adapter function.
 * @example
 * <FavouritesProvider value={ useAtmosphereFavouriteAction }>
 *   { children }
 * </FavouritesProvider>
 */
export const FavouritesProvider = FavouritesContext.Provider;

/**
 * Hook: returns the favourite action for a given post by calling the
 * per-protocol adapter function injected via FavouritesProvider.
 *
 * Must be called inside a component — the adapter fn is itself a custom hook,
 * so the wrapping call site must also follow rules-of-hooks.
 */
export function useFavouriteAction( post: SocialPost ): FavouriteAction {
	const adapterFn = useContext( FavouritesContext );
	return adapterFn( post );
}
