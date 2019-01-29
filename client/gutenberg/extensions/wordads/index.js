/** @format */
/**
 * Internal dependencies
 */
import VRImageEdit from './edit';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'wordads';

export const settings = {
	title: __( 'WordAds' ),
	description: __( 'Some ads' ),
	icon: 'embed-photo',
	category: 'jetpack',
	keywords: [ __( 'ads' ), __( 'earnings' ) ],
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
	save: () => 'Hello WordAds!',
};
