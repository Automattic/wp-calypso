/** @format */

/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/editor';
import { Fragment } from '@wordpress/element';
import { registerBlockStyle } from '@wordpress/blocks';

const TEMPLATE = [ [ 'core/gallery', {} ] ];
const ALLOWED_BLOCKS = [ 'core/gallery' ];

export default ( { className } ) => {
	return (
		<Fragment>
			<div className={ className }>
				<InnerBlocks templateLock="all" template={ TEMPLATE } allowedBlocks={ ALLOWED_BLOCKS } />
			</div>
		</Fragment>
	);
};

registerBlockStyle( 'a8c/tiled-gallery-v3', {
	name: 'a8c-gallery-tile-v3',
	label: _x( 'Tiles', 'Gallery format' ),
} );

registerBlockStyle( 'a8c/tiled-gallery-v3', {
	name: 'a8c-gallery-circle-v3',
	label: _x( 'Circles', 'Gallery format' ),
} );
