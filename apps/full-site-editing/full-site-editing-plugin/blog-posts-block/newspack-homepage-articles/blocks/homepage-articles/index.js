/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';

/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';
import metadata from './block.json';
const { name, attributes, category } = metadata;

// Name must be exported separately.
export { name };

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
	attributes,
	category,
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
					return createBlock(
						applyFilters( 'blocks.transforms_from_name', 'newspack-blocks/homepage-articles' ),
						{
							showExcerpt: displayPostContent,
							showDate: displayPostDate,
							postLayout,
							columns,
							postsToShow,
							showAuthor: false,
							categories: categories ? [ categories ] : [],
						}
					);
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
