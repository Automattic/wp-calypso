/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */

 /**
 * Internal dependencies
 */

export const settings = {
	name: 'atavist/starter',
	title: __( 'Starter' ),
	icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>,
	category: 'common',
	keywords: [
		__( 'Starter' ),
	],
	attributes: {
		align: {
			type: 'string'
		},
		foo: {
			type: 'string',
			default: 'Bar'
		}
	},
	validAlignments: [
		'left',
		'center',
		'right',
		'wide',
		'full'
	],
};
