/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSection } from 'sections-info';

export function getExtensionSettingsPath( plugin ) {
	const section = getSection( plugin && plugin.slug );
	if ( ! section ) {
		return;
	}

	const envs = section.envId;

	if ( ! includes( envs, config( 'env_id' ) ) ) {
		return;
	}

	return section.settings_path;
}
