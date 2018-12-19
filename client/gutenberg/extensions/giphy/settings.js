/** @format */

/**
 * External dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Path, SVG } from '@wordpress/components';

export const settings = {
	name: 'giphy',
	icon: (
		<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<Path fill="none" d="M0 0h24v24H0V0z" />
			<Path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.58c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.42zM8.48 16c.74-.51 2.23-1 3.52-1s2.78.49 3.52 1H8.48zM19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
		</SVG>
	),
	prefix: 'jetpack',
	title: __( 'Giphy' ),
	category: 'jetpack',
	keywords: [ __( 'giphy' ) ],
	description: __( 'Add a giphy graphic.' ),
	attributes: {
		align: {
			type: 'string',
			default: 'center',
		},
		caption: {
			type: 'string',
		},
		giphyUrl: {
			type: 'string',
			default: '//giphy.com/embed/ZgTR3UQ9XAWDvqy9jv',
		},
		searchText: {
			type: 'string',
		},
		topPadding: {
			type: 'number',
			default: 56.2,
		},
	},
	supports: {
		html: false,
	},
	apiKey: 'LtJmY9DnDJUA0',
};
