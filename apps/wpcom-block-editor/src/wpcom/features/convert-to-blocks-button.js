/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */

import { addFilter } from '@wordpress/hooks';
import { BlockControls } from '@wordpress/block-editor';
import { Toolbar, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { rawHandler, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */

export function withConvertToBlocksButton( ClassicEdit ) {
	return class extends ClassicEdit {
		render() {
			const defaultBlock = super.render();

			if ( ! Array.isArray( defaultBlock ) ) {
				return <ClassicEdit { ...this.props } />;
			}

			return (
				<>
					<BlockControls>
						<Toolbar>
							<ToolbarButton
								title={ __( 'Convert to blocks' ) }
								onClick={ this.props.convertToBlocks }
							>
								{ __( 'Convert to blocks' ) }
							</ToolbarButton>
						</Toolbar>
					</BlockControls>
					<ClassicEdit { ...this.props } />
				</>
			);
		}
	};
}

/**
 * Intercepts the registration of the Core Classic block, and adds a 'Convert to Blocks' button
 * to the toolbar.
 *
 * @param {object} blockSettings - The settings of the block being registered.
 *
 * @returns {object} The blockSettings, with our extra functionality inserted.
 */
const convertToBlocksButton = ( blockSettings ) => {
	// Bail if this is not the core classic block, or if the hook has been triggered by a deprecation.
	if ( 'core/freeform' !== blockSettings.name || blockSettings.isDeprecation ) {
		return blockSettings;
	}

	const { edit } = blockSettings;

	return {
		...blockSettings,
		edit: compose(
			withSelect( ( select, { clientId } ) => {
				const block = select( 'core/block-editor' ).getBlock( clientId );
				return {
					block,
				};
			} ),
			withDispatch( ( dispatch, { block } ) => ( {
				convertToBlocks: () =>
					dispatch( 'core/block-editor' ).replaceBlocks(
						block.clientId,
						rawHandler( { HTML: serialize( block ) } )
					),
			} ) )
		)( withConvertToBlocksButton( edit ) ),
	};
};

addFilter( 'blocks.registerBlockType', 'a8c/add-convert-to-classic', convertToBlocksButton );
