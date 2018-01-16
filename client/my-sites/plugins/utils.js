/** @format */

/**
 * External dependencies
 */

import { find, get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import sectionsModule from 'sections-middleware';

export function getExtensionSettingsPath( plugin ) {
	const pluginSlug = get( plugin, 'slug', '' );
	const sections = sectionsModule.getSections();
	const section = find( sections, value => value.name === pluginSlug );
	const env = get( section, 'envId', [] );

	if ( ! includes( env, config( 'env_id' ) ) ) {
		return;
	}

	return get( section, 'settings_path' );
}
