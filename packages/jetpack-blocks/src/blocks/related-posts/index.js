/**
 * External dependencies
 */
import { G, Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import { __, _x } from '../../utils/i18n';

export const name = 'related-posts';

export const settings = {
	title: __( 'Related Posts' ),

	icon: (
		<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<G stroke="currentColor" strokeWidth="2" strokeLinecap="square">
				<Path d="M4,4 L4,19 M4,4 L19,4 M4,9 L19,9 M4,14 L19,14 M4,19 L19,19 M9,4 L9,19 M19,4 L19,19" />
			</G>
		</SVG>
	),

	category: 'jetpack',

	keywords: [
		_x( 'Similar content', 'block search term' ),
		_x( 'Linked', 'block search term' ),
		_x( 'Connected', 'block search term' ),
	],

	attributes: {
		postLayout: {
			type: 'string',
			default: 'grid',
		},
		displayDate: {
			type: 'boolean',
			default: true,
		},
		displayThumbnails: {
			type: 'boolean',
			default: false,
		},
		displayContext: {
			type: 'boolean',
			default: false,
		},
		postsToShow: {
			type: 'number',
			default: 3,
		},
	},

	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},

	transforms: {
		from: [
			{
				type: 'shortcode',
				tag: 'jetpack-related-posts',
			},
		],
	},

	edit,

	save: () => null,
};
