
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/editor';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { select } from '@wordpress/data';
import { Toolbar, IconButton } from '@wordpress/components';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { blockType } from './editor';

const controls = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( props.name === 'core/gallery' ) {

			// Get info about parent block

			// Given a block client ID, returns the root block from which the block is
			// nested, an empty string for top-level blocks, or null if the block does not
			// exist.
			const rootBlockClientId = select( 'core/editor' ).getBlockRootClientId( props.clientId );

			const rootBlock = select( 'core/editor' ).getBlock( rootBlockClientId );

			//eslint-disable-next-line
			console.log( '⚙️', props, rootBlockClientId, rootBlock );

			if ( rootBlock && rootBlock.name === blockType ) {

				return (
					<Fragment>
						<BlockControls>
							<Toolbar>
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Masonry' ) }
									icon="format-gallery"
									onClick={ noop }
								/>
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Squares' ) }
									icon="format-gallery"
									onClick={ noop }
								/>
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Circles' ) }
									icon="format-gallery"
									onClick={ noop }
								/>
							</Toolbar>
						</BlockControls>
						<BlockEdit { ...props } />
					</Fragment>
				);
			}
		}

		return <BlockEdit { ...props } />;
	};
}, 'TiledGalleryControls' );

export default controls;
