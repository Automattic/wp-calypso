/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { __, _x } from '@wordpress/i18n';
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'homepage-articles';
export const title = __( 'Homepage Posts', 'newspack-blocks' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [
		__( 'posts', 'newspack-blocks' ),
		__( 'articles', 'newspack-blocks' ),
		__( 'latest', 'newspack-blocks' ),
	],
	description: __( 'A block for displaying homepage posts.', 'newspack-blocks' ),
	styles: [
		{ name: 'default', label: _x( 'Default', 'block style', 'newspack-blocks' ), isDefault: true },
		{ name: 'borders', label: _x( 'Borders', 'block style', 'newspack-blocks' ) },
	],
	attributes: {
		className: {
			type: 'string',
		},
		showExcerpt: {
			type: 'boolean',
			default: true,
		},
		showDate: {
			type: 'boolean',
			default: true,
		},
		showImage: {
			type: 'boolean',
			default: true,
		},
		showCaption: {
			type: 'boolean',
			default: false,
		},
		imageShape: {
			type: 'string',
			default: 'landscape',
		},
		minHeight: {
			type: 'integer',
			default: 0,
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
		postLayout: {
			type: 'string',
			default: 'list',
		},
		columns: {
			type: 'integer',
			default: 3,
		},
		postsToShow: {
			type: 'integer',
			default: 3,
		},
		mediaPosition: {
			type: 'string',
			default: 'top',
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
		specificPosts: {
			type: 'array',
		},
		typeScale: {
			type: 'integer',
			default: 4,
		},
		imageScale: {
			type: 'integer',
			default: 3,
		},
		mobileStack: {
			type: 'boolean',
			default: false,
		},
		sectionHeader: {
			type: 'string',
			default: '',
		},
		specificMode: {
			type: 'boolean',
			default: false,
		},
		textColor: {
			type: 'string',
			default: '',
		},
		customTextColor: {
			type: 'string',
			default: '',
		},
	},
	supports: {
		html: false,
		align: [ 'wide', 'full' ],
		default: '',
	},
	edit,
	save: () => null, // to use view.php
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/latest-posts' ],
				transform: ( {
					displayPostContent,
					displayPostDate,
					postLayout,
					columns,
					postsToShow,
					categories,
				} ) => {
					return createBlock( 'newspack-blocks/homepage-articles', {
						showExcerpt: displayPostContent,
						showDate: displayPostDate,
						postLayout,
						columns,
						postsToShow,
						showAuthor: false,
						categories: categories ? [ categories ] : [],
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/latest-posts' ],
				transform: ( { showExcerpt, showDate, postLayout, columns, postsToShow, categories } ) => {
					return createBlock( 'core/latest-posts', {
						displayPostContent: showExcerpt,
						displayPostDate: showDate,
						postLayout,
						columns,
						postsToShow,
						categories: categories[ 0 ] || '',
					} );
				},
			},
		],
	},
};
