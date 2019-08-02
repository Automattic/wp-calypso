/* global wp */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import './style.scss';

registerBlockType( 'a8c/post-content', {
	title: __( 'Content Slot' ),
	description: __( 'Placeholder for a post or a page.' ),
	icon: 'layout',
	category: 'layout',
	supports: {
		anchor: true,
		html: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save,
} );

const { createHigherOrderComponent } = wp.compose;
const addContentSlotClassname = createHigherOrderComponent( BlockListBlock => {
	return props => {
		if ( props.name !== 'a8c/post-content' ) {
			return <BlockListBlock { ...props } />;
		}

		return <BlockListBlock { ...props } className={ 'post-content__block' } />;
	};
}, 'addContentSlotClassname' );

addFilter(
	'editor.BlockListBlock',
	'full-site-editing/blocks/post-content',
	addContentSlotClassname
);
