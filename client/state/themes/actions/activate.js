import { isEnabled } from '@automattic/calypso-config';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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
	doesThemeRequireAtomicSite,
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
			doesThemeRequireAtomicSite( getState(), themeId ) &&
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
