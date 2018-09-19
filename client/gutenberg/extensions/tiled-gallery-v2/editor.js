/** @format */

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { registerBlockStyle } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './view.scss';
import TiledGalleryInspectorControls from './inspector-controls';

const blockType = 'a8c/tiled-gallery-v2';

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( props.name !== 'core/gallery' ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ props.isSelected && (
					<TiledGalleryInspectorControls
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				) }
			</Fragment>
		);
	};
}, 'withInspectorControl' );

addFilter( 'editor.BlockEdit', blockType, withInspectorControls );

registerBlockStyle( 'core/gallery', 'tiled' );
