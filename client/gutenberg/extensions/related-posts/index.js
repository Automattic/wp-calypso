/** @format */

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { MAX_POSTS_TO_SHOW } from './constants';

export const name = 'related-posts';

export const settings = {
	title: __( 'Related Posts' ),

	icon: (
		<svg xmlns="http://www.w3.org/2000/svg">
			<defs>
				<path
					id="a"
					d="M4 5v14h17V5H4zm4 2v2H6V7h2zm-2 6v-2h2v2H6zm0 2h2v2H6v-2zm13 2h-9v-2h9v2zm0-4h-9v-2h9v2zm0-4h-9V7h9v2z"
				/>
			</defs>
			<g fill="none" fillRule="evenodd">
				<mask id="b" fill="#fff">
					<use xlinkHref="#a" />
				</mask>
				<g fill="#555D66" mask="url(#b)">
					<path d="M0 0h24v24H0z" />
				</g>
			</g>
		</svg>
	),

	category: 'jetpack',

	keywords: [ __( 'similar' ), __( 'linked' ), __( 'connected' ) ],

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
			default: MAX_POSTS_TO_SHOW,
		},
	},

	supports: {
		html: false,
		multiple: false,
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
