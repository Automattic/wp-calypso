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
import {
	READER_LISTS_DELETE_STATE_CONFIRMING,
	READER_LISTS_DELETE_STATE_DELETED,
} from './constants';

function ListDelete( { list } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ deleteState, setDeleteState ] = React.useState( '' );

	return (
		<>
			{ deleteState === '' && (
				<Card>
					<p>{ translate( 'Delete the list forever. Be careful - this is not reversible.' ) }</p>
					<Button primary onClick={ () => setDeleteState( READER_LISTS_DELETE_STATE_CONFIRMING ) }>
						{ translate( 'Delete list' ) }
					</Button>
				</Card>
			) }
			{ deleteState === READER_LISTS_DELETE_STATE_CONFIRMING && (
				<Dialog
					isVisible={ true }
					buttons={ [
						{ action: 'cancel', label: translate( 'Cancel' ) },
						{ action: 'delete', label: translate( 'Delete list' ), isPrimary: true },
					] }
					onClose={ ( action ) => {
						if ( action === 'delete' ) {
							return [
								dispatch( deleteReaderList( list.ID, list.owner, list.slug ) ),
								setDeleteState( READER_LISTS_DELETE_STATE_DELETED ),
							];
						}

						setDeleteState( '' );
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
