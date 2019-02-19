/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';
import withVideoPressSave from './save';
import isJetpackExtensionAvailable from 'gutenberg/extensions/presets/jetpack/utils/is-jetpack-extension-available';

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
			autoplay: {
				type: 'boolean',
			},
			controls: {
				type: 'boolean',
				default: true,
			},
			loop: {
				type: 'boolean',
			},
			muted: {
				type: 'boolean',
			},
			poster: {
				type: 'string',
			},
			preload: {
				type: 'string',
				default: 'metadata',
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
