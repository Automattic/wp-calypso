/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from 'gutenberg/extensions/presets/jetpack/utils/is-jetpack-extension-available';
import withVideoPressEdit from './edit';
import withVideoPressSave from './save';

const addVideoPressSupport = ( settings, name ) => {
	if ( 'core/video' !== name ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			guid: {
				type: 'string',
			},
		},
		edit: withVideoPressEdit( settings.edit ),
		save: withVideoPressSave( settings.save ),
		deprecated: [
			{
				attributes: settings.attributes,
				save: settings.save,
			},
		],
	};
};

if ( isJetpackExtensionAvailable( 'videopress' ) ) {
	addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
}
