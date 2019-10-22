/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

export const name = 'automattic/onboarding';

export const settings = {
	title: __( 'Onboarding' ),
	category: 'layout', // TODO
	// keywords: [
	// 	_x( 'image', 'block search term', 'jetpack' ),
	// 	_x( 'gallery', 'block search term', 'jetpack' ),
	// 	_x( 'slider', 'block search term', 'jetpack' ),
	// ],
	description: __( 'Onboarding wizard block' ),
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
		siteTitle: {
			type: 'string',
		},
		siteType: {
			type: 'string',
		},
		theme: {
			type: 'string',
		},
		vertical: {
			type: 'string',
		},
	},
	supports: {
		align: [ 'full' ],
		html: false,
	},
	icon: 'universal-access-alt',
	edit,
	save: edit,
	// transforms,
	// example: {
	// 	attributes: exampleAttributes,
	// },
};
