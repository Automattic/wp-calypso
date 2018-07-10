/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import {
	getBlockType,
	createBlock,
	rawHandler,
} from '@wordpress/blocks';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Warning from '../warning';

function InvalidBlockWarning( { convertToHTML, convertToBlocks } ) {
	const hasHTMLBlock = !! getBlockType( 'core/html' );

	return (
		<Warning
			actions={ [
				<Button key="convert" onClick={ convertToBlocks } isLarge isPrimary={ ! hasHTMLBlock }>
					{ __( 'Convert to Blocks' ) }
				</Button>,
				hasHTMLBlock && (
					<Button key="edit" onClick={ convertToHTML } isLarge isPrimary>
						{ __( 'Edit as HTML' ) }
					</Button>
				),
			] }
		>
			{ __( 'This block appears to have been modified externally.' ) }
		</Warning>
	);
}

export default withDispatch( ( dispatch, { block } ) => {
	const { replaceBlock } = dispatch( 'core/editor' );
	return {
		convertToHTML() {
			replaceBlock( block.uid, createBlock( 'core/html', {
				content: block.originalContent,
			} ) );
		},
		convertToBlocks() {
			replaceBlock( block.uid, rawHandler( {
				HTML: block.originalContent,
				mode: 'BLOCKS',
			} ) );
		},
	};
} )( InvalidBlockWarning );
