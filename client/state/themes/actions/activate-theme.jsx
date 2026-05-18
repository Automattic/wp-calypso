import { CALYPSO_CONTACT } from '@automattic/urls';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	productsReinstall,
	productsReinstallNotStarted,
} from 'calypso/state/marketplace/products-reinstall/actions';
import { requestedReinstallProducts } from 'calypso/state/marketplace/products-reinstall/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
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
 * @param {string}  themeId   Theme ID
 * @param {number}  siteId    Site ID
 * @param {Object}  [options] The options
 * @param {string}  [options.source]     The source that is requesting theme activation, e.g. 'showcase'
 * @param {boolean} [options.purchased]  Whether the theme has been purchased prior to activation
 * @param {boolean} [options.showSuccessNotice]  Whether the theme has been purchased prior to activation
 * @param {'basic'|'full'} [options.setupChoice] The user's setup choice from the activation modal: `'full'` runs `/theme-headstart` after activation to add the theme's extra demo content; `'basic'` skips it. Omit on direct activate paths that don't surface the choice (e.g., when the modal isn't shown).
 * @returns {Function}        Action thunk
 */
export function activateTheme( themeId, siteId, options = {} ) {
	return ( dispatch, getState ) => {
		const {
			source = 'unknown',
			purchased = false,
			showSuccessNotice = false,
			setupChoice,
		} = options || {};
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

		let fullSetupFailed = false;

		return wpcom.req
			.post( `/sites/${ siteId }/themes/mine?_locale=user`, {
				theme: themeId,
			} )
			.then( async ( theme ) => {
				if ( styleVariationSlug ) {
					await dispatch(
						activateStyleVariation(
							themeId,
							siteId,
							styleVariationSlug !== 'default' ? themeOptions.styleVariation : {}
						)
					);
				}

				return theme;
			} )
			.then( async ( theme ) => {
				if ( setupChoice === 'full' ) {
					try {
						await wpcom.req.post( {
							path: `/sites/${ siteId }/theme-headstart/?_locale=user`,
							apiNamespace: 'wpcom/v2',
						} );
					} catch ( error ) {
						fullSetupFailed = true;
						dispatch(
							errorNotice(
								translate(
									"Your theme was activated, but we couldn't complete the full setup. The theme's extra content wasn't added."
								)
							)
						);
					}
				}
				return theme;
			} )
			.then( ( theme ) => {
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch(
					themeActivated(
						themeStylesheet,
						siteId,
						source,
						purchased,
						styleVariationSlug,
						setupChoice
					)
				);

				// When the full-setup step failed, the partial-success error
				// notice already conveys the outcome — skip the success notice
				// so we don't show both at once.
				if ( showSuccessNotice && ! fullSetupFailed ) {
					dispatch(
						successNotice(
							translate( 'The %(themeName)s theme is activated successfully!', {
								args: { themeName: theme.name },
							} ),
							{
								button: translate( 'View site' ),
								href: getSiteUrl( getState(), siteId ),
								duration: 20000,
								showDismiss: false,
								onClick: () => {
									dispatch(
										recordTracksEvent( 'calypso_theme_activated_notice_view_site', {
											theme: themeId,
											site: siteId,
										} )
									);
								},
							}
						)
					);
				}

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
