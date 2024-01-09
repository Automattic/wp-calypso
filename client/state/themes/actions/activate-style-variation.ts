import { isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import {
	getGlobalStylesId,
	getGlobalStylesVariations,
	updateGlobalStyles,
} from 'calypso/state/global-styles/actions';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import type { GlobalStyles } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

/**
 * Triggers a network request to activate a specific style variation on a given site.
 * @param {string}  themeId            Theme ID
 * @param {number}  siteId             Site ID
 * @param {string}  styleVariationSlug The slug of the style variation
 * @returns {Function}                 Action thunk
 */
export function activateStyleVariation(
	themeId: string,
	siteId: number,
	styleVariationSlug: string
) {
	return async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		const state = getState();
		const theme = getCanonicalTheme( state, siteId, themeId );
		const themeStylesheet = theme?.stylesheet || themeId;

		if ( styleVariationSlug ) {
			let currentVariation;

			// Clear the global styles if the default style variation is selected.
			if ( isDefaultGlobalStylesVariationSlug( styleVariationSlug ) ) {
				currentVariation = {} as GlobalStyles;
			} else {
				const variations = await dispatch( getGlobalStylesVariations( siteId, themeStylesheet ) );
				currentVariation = variations.find(
					( variation ) =>
						variation.title &&
						variation.title.split( ' ' ).join( '-' ).toLowerCase() === styleVariationSlug
				);
			}

			if ( currentVariation ) {
				const globalStylesId = await dispatch( getGlobalStylesId( siteId, themeStylesheet ) );
				await dispatch( updateGlobalStyles( siteId, globalStylesId, currentVariation ) );
			}
		}
	};
}
