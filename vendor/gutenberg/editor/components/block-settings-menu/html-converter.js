/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { rawHandler, getBlockContent } from '@wordpress/blocks';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

export function HTMLConverter( { block, onReplace, small, canUserUseUnfilteredHTML, role } ) {
	if ( ! block || block.name !== 'core/html' ) {
		return null;
	}

	const label = __( 'Convert to Blocks' );

	const convertToBlocks = () => {
		onReplace( block.uid, rawHandler( {
			HTML: getBlockContent( block ),
			mode: 'BLOCKS',
			canUserUseUnfilteredHTML,
		} ) );
	};

	return (
		<IconButton
			className="editor-block-settings-menu__control"
			onClick={ convertToBlocks }
			icon="screenoptions"
			label={ small ? label : undefined }
			role={ role }
		>
			{ ! small && label }
		</IconButton>
	);
}

export default compose(
	withSelect( ( select, { uid } ) => {
		const { getBlock, getCurrentPostType, canUserUseUnfilteredHTML } = select( 'core/editor' );
		return {
			block: getBlock( uid ),
			postType: getCurrentPostType(),
			canUserUseUnfilteredHTML: canUserUseUnfilteredHTML(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onReplace: dispatch( 'core/editor' ).replaceBlocks,
	} ) ),
)( HTMLConverter );
