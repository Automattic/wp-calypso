/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from 'gutenberg/extensions/presets/jetpack/utils/is-jetpack-extension-available';
import withVideoPressEdit from './edit';

/**
 * Style dependencies
 */
import './editor.scss';

const addVideoPressSupport = ( settings, name ) => {
	if ( 'core/video' !== name ) {
		return settings;
	}

	return {
		...settings,
		edit: withVideoPressEdit( settings.edit ),
	};
};

if ( isJetpackExtensionAvailable( 'videopress' ) ) {
	addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
}
