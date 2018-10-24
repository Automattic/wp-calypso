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

registerBlockType( 'jetpack/vr', {
	title: __( 'VR Image', 'jetpack' ),
	description: __( 'Embed 360° photos and Virtual Reality (VR) content', 'jetpack' ),
	icon: 'embed-photo',
	category: 'jetpack',
	keywords: [ __( 'vr', 'jetpack' ), __( 'panorama', 'jetpack' ), __( '360', 'jetpack' ) ],
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
