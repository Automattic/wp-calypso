/** @format */
/**
 * External dependencies
 */
import wp from 'wp';

wp.blocks.registerBlockType( 'jetpack/related-posts', {
	title: 'Related Posts',
	icon: 'admin-post',
	category: 'layout',
	edit: () => <p>Editing related posts</p>,
	save: () => <p>Saving related posts</p>,
} );
