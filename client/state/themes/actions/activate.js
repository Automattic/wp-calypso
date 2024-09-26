import page from '@automattic/calypso-router';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
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
 * @param  {boolean}  [options.skipActivationModal] Skip the Activation Modal to be shown even if needed on flows that don't require it
 * @returns {Function}          Action thunk
 */
export function activate( themeId, siteId, options ) {
	return ( dispatch, getState ) => {
		const { source, purchased, skipActivationModal } = options || {};

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
		 * Check whether the user has confirmed the activation or is in a flow that doesn't require acceptance.
		 */
		if ( ! hasActivationModalAccepted( getState(), themeId ) && ! skipActivationModal ) {
			return dispatch( showActivationModal( themeId ) );
		}

		const isDotComTheme = !! getTheme( getState(), 'wpcom', themeId );
		const isDotOrgTheme = !! getTheme( getState(), 'wporg', themeId );
		const siteSlug = getSiteSlug( getState(), siteId );
		const hasThemeBundleSoftwareSet = doesThemeBundleSoftwareSet( getState(), themeId );
		const hasRedirection = ( isDotComTheme && hasThemeBundleSoftwareSet ) || isDotOrgTheme;
		const dispatchActivateAction = activateOrInstallThenActivate( themeId, siteId, {
			source,
			purchased,
			showSuccessNotice: ! hasRedirection,
		} );

		// Redirect to the thank-you page if the theme has bundle-plugins.
		if ( isDotComTheme && hasThemeBundleSoftwareSet ) {
			dispatchActivateAction( dispatch, getState );

			return page(
				`/marketplace/thank-you/${ siteSlug }?themes=${ themeId }&continueWithPluginBundle=true`
			);
		}

		if ( isDotOrgTheme ) {
			dispatch( productToBeInstalled( themeId, siteSlug ) );
			return page( `/marketplace/theme/${ themeId }/install/${ siteSlug }` );
		}

		return dispatchActivateAction( dispatch, getState );
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
