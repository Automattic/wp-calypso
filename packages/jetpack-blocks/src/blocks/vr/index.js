/**
 * Internal dependencies
 */
import './editor.scss';
import VRImageEdit from './edit';
import VRImageSave from './save';
import { __ } from '../../utils/i18n';

export const name = 'vr';

export const settings = {
	title: __( 'VR Image' ),
	description: __( 'Embed 360° photos and Virtual Reality (VR) content' ),
	icon: 'embed-photo',
	category: 'jetpack',
	keywords: [ __( 'vr' ), __( 'panorama' ), __( '360' ) ],
	supports: {
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
};
