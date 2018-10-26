/** @format */
/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import VRImageEdit from './edit';
import VRImageSave from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

registerBlockType( 'jetpack/vr', {
	title: __( 'VR Image' ),
	description: __( 'Embed 360° photos and Virtual Reality (VR) content' ),
	icon: 'embed-photo',
	category: 'jetpack',
	keywords: [ __( 'vr' ), __( 'panorama' ), __( '360' ) ],
	support: {
		html: false,
	},
	attributes: {
		url: {
			type: 'string',
		},
		view: {
			type: 'string',
		},
	},
	edit: VRImageEdit,
	save: VRImageSave,
} );
