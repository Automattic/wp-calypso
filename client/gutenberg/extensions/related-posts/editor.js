/** @format */

/**
 * External dependencies
 */
import includes from 'lodash/includes';
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import { ALIGNMENT_OPTIONS, MAX_POSTS_TO_SHOW } from './constants';

registerBlockType( 'a8c/related-posts', {
	title: __( 'Related Posts', 'jetpack' ),

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

	category: 'layout',

	keywords: [ __( 'similar', 'jetpack' ), __( 'linked', 'jetpack' ), __( 'connected', 'jetpack' ) ],

	attributes: {
		align: {
			type: 'string',
			default: '',
		},
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
			default: true,
		},
		postsToShow: {
			type: 'number',
			default: MAX_POSTS_TO_SHOW,
		},
	},

	getEditWrapperProps: attributes => {
		const { align } = attributes;

		if ( includes( ALIGNMENT_OPTIONS, align ) ) {
			return { 'data-align': align };
		}
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
} );
