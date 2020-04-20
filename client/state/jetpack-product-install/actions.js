/**
 * Internal dependencies
 */
import {
	JETPACK_PRODUCT_INSTALL_REQUEST,
	JETPACK_PRODUCT_INSTALL_STATUS_RECEIVE,
	JETPACK_PRODUCT_INSTALL_STATUS_REQUEST,
} from 'state/action-types';

import 'state/data-layer/wpcom/jetpack-blogs/product-install';
import 'state/data-layer/wpcom/jetpack-blogs/product-install-status';

/**
 * Start the Jetpack product install process for that site.
 *
 * @param {number}  siteId        The ID of the site.
 * @param {(string|null)}  akismetKey    Akismet key.
 * @param {(string|null)}  vaultpressKey VaultPress key.
 * @returns {object}               Action object.
 */
export const startJetpackProductInstall = ( siteId, akismetKey, vaultpressKey ) => ( {
	type: JETPACK_PRODUCT_INSTALL_REQUEST,
	siteId,
	akismetKey,
	vaultpressKey,
} );

/**
 * Retrieve the current status of the Jetpack product install for that site.
 *
 * @param {number} siteId The ID of the site.
 * @returns {object}       Action object.
 */
export const requestJetpackProductInstallStatus = ( siteId ) => ( {
	type: JETPACK_PRODUCT_INSTALL_STATUS_REQUEST,
	siteId,
} );

/**
 * Receive current Jetpack product installation status.
 *
 * @param {number} siteId The ID of the site.
 * @param {object} status Product installation status.
 * @returns {object}       Action object.
 */
export const receiveJetpackProductInstallStatus = ( siteId, status ) => ( {
	type: JETPACK_PRODUCT_INSTALL_STATUS_RECEIVE,
	siteId,
	status,
} );
