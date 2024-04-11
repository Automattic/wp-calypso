import { CALYPSO_CONTACT } from '@automattic/urls';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	productsReinstall,
	productsReinstallNotStarted,
} from 'calypso/state/marketplace/products-reinstall/actions';
import { requestedReinstallProducts } from 'calypso/state/marketplace/products-reinstall/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { THEME_ACTIVATE, THEME_ACTIVATE_FAILURE } from 'calypso/state/themes/action-types';
import { themeActivated } from 'calypso/state/themes/actions/theme-activated';
import {
	getThemePreviewThemeOptions,
	isMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import 'calypso/state/themes/init';
import { activateStyleVariation } from './activate-style-variation';

/**
 * Triggers a network request to activate a specific theme on a given site.
 * @param {string}  themeId            Theme ID
 * @param {number}  siteId             Site ID
 * @param {string}  source             The source that is requesting theme activation, e.g. 'showcase'
 * @param {boolean} purchased          Whether the theme has been purchased prior to activation
 * @returns {Function}                 Action thunk
 */
export function activateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		const themeOptions = getThemePreviewThemeOptions( getState() );
		const styleVariationSlug =
			themeOptions && themeOptions.themeId === themeId
				? themeOptions.styleVariation?.slug
				: undefined;

		dispatch( {
			type: THEME_ACTIVATE,
			themeId,
			siteId,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/themes/mine?_locale=user`, {
				theme: themeId,
			} )
			.then( async ( theme ) => {
				if ( styleVariationSlug ) {
					await dispatch( activateStyleVariation( themeId, siteId, themeOptions.styleVariation ) );
				}

				return theme;
			} )
			.then( ( theme ) => {
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch(
					themeActivated( themeStylesheet, siteId, source, purchased, styleVariationSlug )
				);
				return themeStylesheet;
			} )
			.catch( ( error ) => {
				if ( isMarketplaceThemeSubscribed( getState(), themeId, siteId ) ) {
					if ( ! requestedReinstallProducts( getState(), siteId ) ) {
						return dispatch( productsReinstall( siteId, themeId ) );
					}
					dispatch( productsReinstallNotStarted( siteId ) );
				}
				dispatch( {
					type: THEME_ACTIVATE_FAILURE,
					themeId,
					siteId,
					error,
				} );

				if ( error.error === 'theme_not_found' ) {
					dispatch( errorNotice( translate( 'Theme not yet available for this site' ) ) );
				} else {
					dispatch(
						errorNotice(
							translate(
								'Unable to activate theme. {{contactSupportLink}}Contact support{{/contactSupportLink}}.',
								{
									components: {
										contactSupportLink: (
											<a target="_blank" href={ CALYPSO_CONTACT } rel="noreferrer" />
										),
									},
								}
							)
						)
					);
				}
			} );
	};
}
