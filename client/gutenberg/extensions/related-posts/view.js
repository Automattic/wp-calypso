/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import { MAX_POSTS_TO_SHOW } from './constants';

registerBlockType( 'a8c/related-posts', {
	title: __( 'Related Posts' ),

	icon: 'admin-page',

	category: 'layout',

	attributes: {
		align: {
			type: 'string',
			default: '',
		},
		postLayout: {
			type: 'string',
			default: 'grid',
		},
		headline: {
			type: 'string',
			default: __( 'Related' ),
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

		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
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
