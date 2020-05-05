/**
 * External dependencies
 */

import { find } from 'lodash';

export function updateSettings( group, settings = [], data ) {
	// go through each existing setting
	// if an update is present in data, replace the setting with the update
	const newSettings = settings.map( ( setting ) => {
		const update = find( data.update, { id: setting.id } );
		if ( update ) {
			return update;
		}
		return setting;
	} );

	// if update adds adds a new setting, append it to settings
	data.update.forEach( ( update ) => {
		if ( group === update.group_id && ! find( settings, { id: update.id } ) ) {
			newSettings.push( update );
		}
	} );

	return newSettings;
}
