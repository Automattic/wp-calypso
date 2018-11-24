/** @format */

/**
 * External dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const settings = {
	name: 'jetpack/slideshow',
	title: __( 'Slideshow' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path d="M0 0h24v24H0z" fill="none" />
			<path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
		</svg>
	),
	category: 'jetpack',
	keywords: [ __( 'slideshow' ), __( 'image' ) ],
	description: __( 'Add an interactive slideshow.' ),
	attributes: {
		align: {
			type: 'string',
		},
	},
	validAlignments: [ 'center', 'wide', 'full' ],
};
