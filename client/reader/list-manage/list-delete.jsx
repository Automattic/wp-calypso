/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card, Dialog } from '@automattic/components';
import { deleteReaderList } from 'calypso/state/reader/lists/actions';

function ListDelete( { list } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = React.useState( false );

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
							dispatch( deleteReaderList( list.ID, list.owner, list.slug ) );
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
