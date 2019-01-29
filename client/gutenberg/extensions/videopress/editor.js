/** @format */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from 'gutenberg/extensions/presets/jetpack/utils/is-jetpack-extension-available';
import withVideoPressEdit from './edit';

const addVideoPressSupport = ( settings, name ) =>
	'core/video' === name ? { ...settings, edit: withVideoPressEdit( settings.edit ) } : settings;

if ( isJetpackExtensionAvailable( 'videopress' ) ) {
	addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
}
