/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';
import withVideoPressSave from './save';
import { isEnabled } from 'config';

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

// TODO: Check availability using the availability endpoint. Since this extension is not registered on the server yet,
// we need to bypass the `isJetpackExtensionAvailable` check
if ( isEnabled( 'jetpack/blocks/beta' ) ) {
	addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
}
