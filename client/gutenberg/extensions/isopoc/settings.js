/** @format */

/**
 * External dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const settings = {
	name: 'isopoc',
	prefix: 'jetpack',
	title: __( 'Isomorphic P.O.C.' ),
	icon: 'shield',
	category: 'jetpack',
	description: __( 'Proof of concept for isomorphic React.' ),
	attributes: {
		align: {
			type: 'string',
		},
		complex: {
			type: 'array',
			default: [],
		},
		simple: {
			type: 'string',
			default: 'A Simple String',
		},
		content: {
			type: 'string',
		},
	},
	supports: {
		html: false,
		align: true,
	},
};
