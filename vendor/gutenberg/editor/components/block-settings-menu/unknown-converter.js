/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { getUnknownTypeHandlerName, rawHandler, serialize } from '@wordpress/blocks';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

export function UnknownConverter( { block, onReplace, small, canUserUseUnfilteredHTML, role } ) {
	if ( ! block || getUnknownTypeHandlerName() !== block.name ) {
		return null;
	}

	const label = __( 'Convert to Blocks' );

	const convertToBlocks = () => {
		onReplace( block.uid, rawHandler( {
			HTML: serialize( block ),
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
		const { canUserUseUnfilteredHTML, getBlock, getCurrentPostType } = select( 'core/editor' );
		return {
			block: getBlock( uid ),
			postType: getCurrentPostType(),
			canUserUseUnfilteredHTML: canUserUseUnfilteredHTML(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onReplace: dispatch( 'core/editor' ).replaceBlocks,
	} ) ),
)( UnknownConverter );
