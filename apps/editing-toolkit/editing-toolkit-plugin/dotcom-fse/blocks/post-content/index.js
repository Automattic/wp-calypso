/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { getCategoryWithFallbacks } from '../../../block-helpers';
import './style.scss';

registerBlockType( 'a8c/post-content', {
	title: __( 'Content', 'full-site-editing' ),
	description: __( 'The page content.', 'full-site-editing' ),
	icon: 'layout',
	category: getCategoryWithFallbacks( 'design', 'layout' ),
	supports: {
		align: [ 'full' ],
		anchor: false,
		customClassName: false,
		html: false,
		inserter: false,
		multiple: false,
		reusable: false,
	},
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
	},
	edit,
	save,
} );

const addContentSlotClassname = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		if ( props.name !== 'a8c/post-content' ) {
			return <BlockListBlock { ...props } />;
		}

		return <BlockListBlock { ...props } className={ 'post-content__block' } />;
	};
}, 'addContentSlotClassname' );

// Must be 9 or this breaks on Simple Sites
addFilter(
	'editor.BlockListBlock',
	'full-site-editing/blocks/post-content',
	addContentSlotClassname,
	9
);
