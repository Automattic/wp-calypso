/** @format */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';

const addVideoPressSupport = ( settings, name ) => {
	if ( 'core/video' === name ) {
		const CoreVideoEdit = settings.edit;

		settings = {
			...settings,
			edit: withVideoPressEdit( CoreVideoEdit ),
		};
	}
	return settings;
};

addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
