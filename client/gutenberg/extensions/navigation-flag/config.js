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

export const CONFIG = {
	name: 'atavist/navigation-flag',
	title: __( 'Navigation - Flag' ),
	icon: 'shield',
	category: 'layout',
	keywords: [
		__( 'Atavist' ),
		__( 'Layout' ),
	],
	attributes: {
		footer_text: {
			type: 'string'
		},
		menu_slug: {
			type: 'string'
		}
	},
	baseClasses: [
		'nav-wrapper',
		'navigation-Flag'
	]
}
