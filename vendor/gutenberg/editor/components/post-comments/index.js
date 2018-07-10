/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { FormToggle, withInstanceId } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

function PostComments( { commentStatus = 'open', instanceId, ...props } ) {
	const onToggleComments = () => props.editPost( { comment_status: commentStatus === 'open' ? 'closed' : 'open' } );

	const commentsToggleId = 'allow-comments-toggle-' + instanceId;

	return [
		<label key="label" htmlFor={ commentsToggleId }>{ __( 'Allow Comments' ) }</label>,
		<FormToggle
			key="toggle"
			checked={ commentStatus === 'open' }
			onChange={ onToggleComments }
			id={ commentsToggleId }
		/>,
	];
}

export default compose( [
	withSelect( ( select ) => {
		return {
			commentStatus: select( 'core/editor' ).getEditedPostAttribute( 'comment_status' ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		editPost: dispatch( 'core/editor' ).editPost,
	} ) ),
	withInstanceId,
] )( PostComments );
