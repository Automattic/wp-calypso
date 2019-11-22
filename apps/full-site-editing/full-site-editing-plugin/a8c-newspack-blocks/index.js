/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Change the block name through of the `registerBlockType` hook.
addFilter( 'blocks.registerBlockType', 'a8c/renaming-newspack-blocks', ( settings, name ) =>
	'newspack-blocks/homepage-articles' === name
		? { ...settings, title: __( 'Homepage Posts' ) }
		: settings
);
