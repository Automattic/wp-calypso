/** @format */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import withVideoPressEdit from './edit';

const addVideoPressSupport = ( settings, name ) =>
	'core/video' === name ? { ...settings, edit: withVideoPressEdit( settings.edit ) } : settings;

addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
