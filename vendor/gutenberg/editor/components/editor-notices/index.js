/**
 * WordPress dependencies
 */
import { NoticeList } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplateValidationNotice from '../template-validation-notice';

function EditorNotices( props ) {
	return (
		<NoticeList { ...props }>
			<TemplateValidationNotice />
		</NoticeList>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		notices: select( 'core/editor' ).getNotices(),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		onRemove: dispatch( 'core/editor' ).removeNotice,
	} ) ),
] )( EditorNotices );
