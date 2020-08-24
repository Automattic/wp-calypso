/**
 * External dependencies
 */

import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSections } from 'sections-helper';

const getSettingsPath = () => {
	const sections = getSections();
	const section = find( sections, ( value ) => value.name === 'zoninator' );

	return get( section, 'settings_path' );
};

export const settingsPath = getSettingsPath();
