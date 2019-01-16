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
			<Path d="M17.343 9.171h-4.114V5.057H7.057v13.886h10.286V9.17zm2.057-.514V21H5V3h10.286v2.057h2.057v2.057H19.4v1.543z" />
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
