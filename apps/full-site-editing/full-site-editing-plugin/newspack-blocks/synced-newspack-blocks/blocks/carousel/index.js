/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './view.scss';
import './editor.scss';

export const name = 'carousel';
export const title = __( 'Post Carousel', 'full-site-editing' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [
		__( 'posts', 'full-site-editing' ),
		__( 'slideshow', 'full-site-editing' ),
		__( 'carousel', 'full-site-editing' ),
	],
	description: __( 'A carousel of posts.', 'full-site-editing' ),
	attributes: {
		className: {
			type: 'string',
		},
		autoplay: {
			type: 'boolean',
			default: false,
		},
		delay: {
			type: 'number',
			default: 5,
		},
		postsToShow: {
			type: 'integer',
			default: 3,
		},
		authors: {
			type: 'array',
		},
		categories: {
			type: 'array',
		},
		tags: {
			type: 'array',
		},
		showDate: {
			type: 'boolean',
			default: true,
		},
		showAuthor: {
			type: 'boolean',
			default: true,
		},
		showAvatar: {
			type: 'boolean',
			default: true,
		},
		showCategory: {
			type: 'boolean',
			default: false,
		},
	},
	supports: {
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
};
