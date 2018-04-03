/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getSection } from 'sections-info';

const getSettingsPath = () => {
	const section = getSection( 'zoninator' );
	return section && section.settings_path;
};

export const settingsPath = getSettingsPath();
