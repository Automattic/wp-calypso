/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import VRImageEdit from './edit';
import VRImageSave from './save';

registerBlockType( 'a8c/vr', {
	title: __( 'VR Image', 'jetpack' ),
	description: __( 'Embed 360° photos and Virtual Reality (VR) Content', 'jetpack' ),
	icon: 'embed-photo',
	category: 'jetpack',
	support: {
		html: false,
	},
	attributes: {
		url: {
			type: 'string',
			default: '',
		},
		view: {
			type: 'string',
			default: '',
		},
	},
	edit: VRImageEdit,
	save: VRImageSave,
} );
