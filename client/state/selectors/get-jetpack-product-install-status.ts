import type { AppState } from 'calypso/types';

import 'calypso/state/jetpack-product-install/init';

export type PluginStatusSlug = `${ string }_status`;
export type JetpackProductInstallStatus = {
	akismet_status: string;
	progress: number;
	vaultpress_status: string;
} & {
	[ pluginSlug: PluginStatusSlug ]: string;
};

/**
 * @param {object} state  Global app state.
 * @param {number} siteId ID of the site to get Jetpack product install status of.
 * @returns {?object} An object containing the current Jetpack product install status.
 */
export default function getJetpackProductInstallStatus(
	state: AppState,
	siteId: number
): JetpackProductInstallStatus | null {
	return state.jetpackProductInstall?.[ siteId ] ?? null;
}
