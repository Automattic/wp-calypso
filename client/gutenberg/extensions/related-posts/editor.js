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
	title: __( 'Related Posts' ),

	icon: (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M0,0h24v24H0V0z" fill="none" />
			<rect x="11" y="7" width="6" height="2" />
			<rect x="11" y="11" width="6" height="2" />
			<rect x="11" y="15" width="6" height="2" />
			<rect x="7" y="7" width="2" height="2" />
			<rect x="7" y="11" width="2" height="2" />
			<rect x="7" y="15" width="2" height="2" />
			<path d="M20.1,3H3.9C3.4,3,3,3.4,3,3.9v16.2C3,20.5,3.4,21,3.9,21h16.2c0.4,0,0.9-0.5,0.9-0.9V3.9C21,3.4,20.5,3,20.1,3z M19,19H5V5h14V19z" />
		</svg>
	),

	category: 'layout',

	keywords: [ __( 'similar' ), __( 'linked' ), __( 'connected' ) ],

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
