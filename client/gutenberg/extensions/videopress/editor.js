/** @format */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import registerJetpackExtension from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-extension';
import withVideoPressEdit from './edit';

const initVideoPressExtension = () => {
	const addVideoPressSupport = ( settings, name ) =>
		'core/video' === name ? { ...settings, edit: withVideoPressEdit( settings.edit ) } : settings;

	addFilter( 'blocks.registerBlockType', 'gutenberg/extensions/videopress', addVideoPressSupport );
};

registerJetpackExtension( 'videopress', initVideoPressExtension );
