/** @format */
/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import sectionsModule from 'sections';

const getSettingsPath = () => {
	const sections = sectionsModule.get();
	const section = find( sections, value => value.name === 'zoninator' );

	return get( section, 'settings_path' );
};

export const settingsPath = getSettingsPath();
