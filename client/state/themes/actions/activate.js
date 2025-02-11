import page from '@automattic/calypso-router';
import { hasQueryArg } from '@wordpress/url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { activateTheme } from 'calypso/state/themes/actions/activate-theme';
import { installAndActivateTheme } from 'calypso/state/themes/actions/install-and-activate-theme';
import { showAtomicTransferDialog } from 'calypso/state/themes/actions/show-atomic-transfer-dialog';
import { suffixThemeIdForInstall } from 'calypso/state/themes/actions/suffix-theme-id-for-install';
import { showActivationModal } from 'calypso/state/themes/actions/theme-activation-modal';
import {
	getTheme,
	hasActivationModalAccepted,
	wasAtomicTransferDialogAccepted,
	isExternallyManagedTheme,
	doesThemeBundleSoftwareSet,
} from 'calypso/state/themes/selectors';
import 'calypso/state/themes/init';

/**
 * Triggers a network request to activate a specific theme on a given site.
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {Object}   [options] The options
 * @param  {string}   [options.source]    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  [options.purchased] Whether the theme has been purchased prior to activation
 * @param  {boolean}  [options.isOnboardingFlow] Whether the activation happens in the onboarding flow
 * @returns {Function}          Action thunk
 */
export function activate( themeId, siteId, options ) {
	return ( dispatch, getState ) => {
		const {
			source,
			purchased,
			isOnboardingFlow = typeof window !== 'undefined' &&
				hasQueryArg( window.location.href, 'onboarding' ),
			showSuccessNotice = true,
		} = options || {};
		const isDotComTheme = !! getTheme( getState(), 'wpcom', themeId );
		const isDotOrgTheme = !! getTheme( getState(), 'wporg', themeId );
		const hasThemeBundleSoftwareSet = doesThemeBundleSoftwareSet( getState(), themeId );
		const shouldAtomicTransfer =
			isExternallyManagedTheme( getState(), themeId ) ||
			// The wporg-only themes need the atomic transfer.
			( isDotOrgTheme && ! isDotComTheme ) ||
			// On the onboarding flow, the plugin-bundle theme will continue to the plugin bundle flow.
			( isDotComTheme && hasThemeBundleSoftwareSet && ! isOnboardingFlow );

		/**
		 * Make sure to show the Atomic transfer dialog if the theme requires
		 * an Atomic site. If the dialog has been accepted, we can continue.
		 */
		if (
			shouldAtomicTransfer &&
			! isJetpackSite( getState(), siteId ) &&
			! isSiteAtomic( getState(), siteId ) &&
			! wasAtomicTransferDialogAccepted( getState(), themeId )
		) {
			return dispatch( showAtomicTransferDialog( themeId ) );
		}

		/**
		 * Check whether the user has confirmed the activation or is in a flow that doesn't require acceptance.
		 */
		if ( ! hasActivationModalAccepted( getState(), themeId ) && ! isOnboardingFlow ) {
			return dispatch( showActivationModal( themeId ) );
		}

		const siteSlug = getSiteSlug( getState(), siteId );

		// Redirect to the thank-you page if the theme has plugin bundle and is being activated in the onboarding flow.
		// The thank-you page will continue to the plugin bundle flow and display the atomic transfer at the last step.
		if ( isDotComTheme && hasThemeBundleSoftwareSet && isOnboardingFlow ) {
			activateOrInstallThenActivate( themeId, siteId, {
				source,
				purchased,
			} )( dispatch, getState );

			return page(
				`/marketplace/thank-you/${ siteSlug }?themes=${ themeId }&continueWithPluginBundle=true`
			);
		}

		return activateOrInstallThenActivate( themeId, siteId, {
			source,
			purchased,
			showSuccessNotice,
		} )( dispatch, getState );
	};
}

/**
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 * Otherwise, activate the theme directly
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {Object}   [options] The options
 * @param  {string}   [options.source]    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  [options.purchased] Whether the theme has been purchased prior to activation
 * @returns {Function}          Action thunk
 */
export function activateOrInstallThenActivate( themeId, siteId, options ) {
	return ( dispatch, getState ) => {
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail,
			// and it will just be activated.
			return dispatch( installAndActivateTheme( installId, siteId, options ) );
		}

		return dispatch( activateTheme( themeId, siteId, options ) );
	};
}
