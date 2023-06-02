import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { activateTheme } from 'calypso/state/themes/actions/activate-theme';
import { installAndActivateTheme } from 'calypso/state/themes/actions/install-and-activate-theme';
import { showAtomicTransferDialog } from 'calypso/state/themes/actions/show-atomic-transfer-dialog';
import { showAutoLoadingHomepageWarning } from 'calypso/state/themes/actions/show-auto-loading-homepage-warning';
import { suffixThemeIdForInstall } from 'calypso/state/themes/actions/suffix-theme-id-for-install';
import {
	getTheme,
	hasAutoLoadingHomepageModalAccepted,
	themeHasAutoLoadingHomepage,
	wasAtomicTransferDialogAccepted,
	isExternallyManagedTheme,
	doesThemeBundleSoftwareSet,
} from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to activate a specific theme on a given site.
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @param  {boolean}  keepCurrentHomepage Prevent theme from switching homepage content if this is what it'd normally do when activated
 * @returns {Function}          Action thunk
 */
export function activate(
	themeId,
	siteId,
	source = 'unknown',
	purchased = false,
	keepCurrentHomepage = false
) {
	return ( dispatch, getState ) => {
		let showModalCondition =
			! isJetpackSite( getState(), siteId ) && ! isSiteAtomic( getState(), siteId );

		if ( isEnabled( 'themes/atomic-homepage-replace' ) ) {
			showModalCondition =
				! isJetpackSite( getState(), siteId ) || isSiteAtomic( getState(), siteId );
		} else {
			// Keep default behaviour on Atomic. See https://github.com/Automattic/wp-calypso/pull/65846#issuecomment-1192650587
			keepCurrentHomepage = isSiteAtomic( getState(), siteId ) ? true : keepCurrentHomepage;
		}

		/**
		 * Make sure to show the Atomic transfer dialog if the theme requires
		 * an Atomic site. If the dialog has been accepted, we can continue.
		 */
		if (
			isExternallyManagedTheme( getState(), themeId ) &&
			! isJetpackSite( getState(), siteId ) &&
			! isSiteAtomic( getState(), siteId ) &&
			! wasAtomicTransferDialogAccepted( getState(), themeId )
		) {
			return dispatch( showAtomicTransferDialog( themeId ) );
		}

		/**
		 * Let's check if the theme will change the homepage of the site,
		 * before to definitely start the theme-activating process,
		 * allowing cancel it if it's desired.
		 */
		if (
			themeHasAutoLoadingHomepage( getState(), themeId, siteId ) &&
			showModalCondition &&
			! hasAutoLoadingHomepageModalAccepted( getState(), themeId )
		) {
			return dispatch( showAutoLoadingHomepageWarning( themeId ) );
		}

		/**
		 * Check if its a free or premium dotcom theme, if so, dispatch the activate action
		 * and redirect to the Marketplace Thank You Page.
		 *
		 * A theme is considered free or premium when it is not:
		 * - ExternallyManaged
		 * - A software bundle (like woo-on-plans)
		 *
		 * Currently a feature flag check is also being applied.
		 */
		const isExternallyManaged = isExternallyManagedTheme( getState(), themeId );
		const isWooTheme = doesThemeBundleSoftwareSet( getState(), themeId );
		const isDotComTheme = !! getTheme( getState(), 'wpcom', themeId );
		const siteSlug = getSiteSlug( getState(), siteId );
		const dispatchActivateAction = activateOrInstallThenActivate(
			themeId,
			siteId,
			source,
			purchased,
			keepCurrentHomepage
		);

		if (
			isEnabled( 'themes/display-thank-you-page' ) &&
			isDotComTheme &&
			! isWooTheme &&
			! isExternallyManaged
		) {
			dispatchActivateAction( dispatch, getState );

			return page( `/marketplace/thank-you/${ siteSlug }?themes=${ themeId }` );
		}

		/* Check if the theme is a .org Theme and not provided by .com as well (as Premium themes)
		 * and redirect it to the Marketplace theme installation page
		 */
		const isDotOrgTheme = !! getTheme( getState(), 'wporg', themeId );
		if ( isDotOrgTheme && ! isDotComTheme ) {
			dispatch( productToBeInstalled( themeId, siteSlug ) );
			return page( `/marketplace/theme/${ themeId }/install/${ siteSlug }` );
		}

		return dispatchActivateAction( dispatch, getState );
	};
}

/**
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 * Otherwise, activate the theme directly
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @param  {boolean}  keepCurrentHomepage Prevent theme from switching homepage content if this is what it'd normally do when activated
 * @returns {Function}          Action thunk
 */
export function activateOrInstallThenActivate(
	themeId,
	siteId,
	source = 'unknown',
	purchased = false,
	keepCurrentHomepage = false
) {
	return ( dispatch, getState ) => {
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail,
			// and it will just be activated.
			return dispatch(
				installAndActivateTheme( installId, siteId, source, purchased, keepCurrentHomepage )
			);
		}

		return dispatch( activateTheme( themeId, siteId, source, purchased, keepCurrentHomepage ) );
	};
}
