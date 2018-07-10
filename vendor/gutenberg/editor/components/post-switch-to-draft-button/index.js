/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

function PostSwitchToDraftButton( { isSaving, isPublished, onClick } ) {
	if ( ! isPublished ) {
		return null;
	}

	const onSwitch = () => {
		// eslint-disable-next-line no-alert
		if ( window.confirm( __( 'Are you sure you want to unpublish this post?' ) ) ) {
			onClick();
		}
	};

	return (
		<Button
			className="editor-post-switch-to-draft"
			isLarge
			onClick={ onSwitch }
			disabled={ isSaving }
		>
			{ __( 'Switch to Draft' ) }
		</Button>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const { isSavingPost, isCurrentPostPublished } = select( 'core/editor' );
		return {
			isSaving: isSavingPost(),
			isPublished: isCurrentPostPublished(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { editPost, savePost } = dispatch( 'core/editor' );
		return {
			onClick: () => {
				editPost( { status: 'draft' } );
				savePost();
			},
		};
	} ),
] )( PostSwitchToDraftButton );

