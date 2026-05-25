import { deleteReadListMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Card, Dialog } from '@automattic/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

function ListDelete( { list } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState( false );
	const { mutate: deleteList } = useMutation( deleteReadListMutation( queryClient ) );

	const handleDelete = () => {
		deleteList(
			{ owner: list.owner, slug: list.slug },
			{
				onSuccess: () => {
					page( '/reader' );
					dispatch(
						successNotice( translate( 'List deleted successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} )
					);
				},
				onError: () => {
					dispatch( errorNotice( translate( 'Unable to delete list.' ) ) );
				},
			}
		);
	};

	return (
		<>
			<Card>
				<p>{ translate( 'Delete the list forever. Be careful - this is not reversible.' ) }</p>
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Delete list' ) }
				</Button>
			</Card>

			{ showDeleteConfirmation && (
				<Dialog
					isVisible
					buttons={ [
						{ action: 'cancel', label: translate( 'Cancel' ) },
						{ action: 'delete', label: translate( 'Delete list' ), isPrimary: true },
					] }
					onClose={ ( action ) => {
						setShowDeleteConfirmation( false );
						if ( action === 'delete' ) {
							handleDelete();
						}
					} }
				>
					<h1>{ translate( 'Are you sure you want to delete this list?' ) }</h1>
					<p>{ translate( 'This action cannot be undone.' ) }</p>
				</Dialog>
			) }
		</>
	);
}

export default ListDelete;
