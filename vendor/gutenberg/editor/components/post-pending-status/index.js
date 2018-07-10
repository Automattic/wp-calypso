/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { FormToggle, withInstanceId } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PostPendingStatusCheck from './check';

export function PostPendingStatus( { instanceId, status, onUpdateStatus } ) {
	const pendingId = 'pending-toggle-' + instanceId;
	const togglePendingStatus = () => {
		const updatedStatus = status === 'pending' ? 'draft' : 'pending';
		onUpdateStatus( updatedStatus );
	};

	return (
		<PostPendingStatusCheck>
			<label htmlFor={ pendingId }>{ __( 'Pending Review' ) }</label>
			<FormToggle
				id={ pendingId }
				checked={ status === 'pending' }
				onChange={ togglePendingStatus }
			/>
		</PostPendingStatusCheck>
	);
}

export default compose(
	withSelect( ( select ) => ( {
		status: select( 'core/editor' ).getEditedPostAttribute( 'status' ),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		onUpdateStatus( status ) {
			dispatch( 'core/editor' ).editPost( { status } );
		},
	} ) ),
	withInstanceId
)( PostPendingStatus );
