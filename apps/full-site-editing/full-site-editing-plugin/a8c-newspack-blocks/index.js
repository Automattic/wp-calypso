/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Change the block name through of the `registerBlockType` hook.
addFilter( 'blocks.registerBlockType', 'a8c/renaming-newspack-blocks', ( settings, name ) => {
	if ( 'newspack-blocks/homepage-articles' !== name ) {
		return settings;
	}

	return {
		...settings,
		name: 'a8c/homepage-posts',
		title: __( 'Homepage Posts' ),
		category: 'layout',
	};
} );
