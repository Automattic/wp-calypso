import { createBlock } from '@wordpress/blocks';

const HOMEPAGE_POSTS_BLOCK_TYPES = [ 'a8c/blog-posts', 'newspack-blocks/homepage-articles' ];

const getTransformFunction =
	( type ) =>
	( { postsPerPage } ) => {
		// Configure the Newspack block to look as close as possible
		// to the output of this one.
		return createBlock( type, {
			postsToShow: postsPerPage,
			showAvatar: false,
			displayPostDate: true,
			displayPostContent: true,
		} );
	};

export const isValidHomepagePostsBlockType = ( type ) =>
	HOMEPAGE_POSTS_BLOCK_TYPES.indexOf( type ) > -1;

export const transforms = {
	to: HOMEPAGE_POSTS_BLOCK_TYPES.map( ( type ) => ( {
		type: 'block',
		blocks: [ type ],
		transform: getTransformFunction( type ),
	} ) ),
};
