/**
 * WordPress dependencies
 */
import { ClipboardButton } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { withState, compose } from '@wordpress/compose';

function CopyContentMenuItem( { editedPostContent, hasCopied, setState } ) {
	return (
		<ClipboardButton
			text={ editedPostContent }
			className="components-menu-item__button"
			onCopy={ () => setState( { hasCopied: true } ) }
			onFinishCopy={ () => setState( { hasCopied: false } ) }
		>
			{ hasCopied ?
				__( 'Copied!' ) :
				__( 'Copy All Content' ) }
		</ClipboardButton>
	);
}

export default compose(
	withSelect( ( select ) => ( {
		editedPostContent: select( 'core/editor' ).getEditedPostAttribute( 'content' ),
	} ) ),
	withState( { hasCopied: false } )
)( CopyContentMenuItem );
