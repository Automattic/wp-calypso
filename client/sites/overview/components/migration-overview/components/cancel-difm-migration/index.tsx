import { isEnabled } from '@automattic/calypso-config';
import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingBar } from 'calypso/components/loading-bar';
import wp from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

const CancelDifmMigrationForm = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	const [ cancellationStatus, setCancellationStatus ] = useState<
		'pending' | 'error' | 'success' | null
	>( null );

	if ( ! isEnabled( 'migration-flow/cancel-difm' ) ) {
		return null;
	}

	const handleSendCancellationRequest = async ( siteId: number ) => {
		try {
			return await wp.req.post( {
				path: `/sites/${ siteId }/automated-migration/cancel-migration`,
				apiNamespace: 'wpcom/v2',
			} );
		} catch ( error ) {
			return error;
		}
	};

	const handleCancelMigration = async ( siteId: number ) => {
		setCancellationStatus( 'pending' );
		closeModal();
		const response = await handleSendCancellationRequest( siteId );

		if ( ! response?.success ) {
			setCancellationStatus( 'error' );
			dispatch(
				errorNotice(
					translate(
						"We couldn't cancel your migration. Our support team will reach out to help."
					),
					{ duration: 5000 }
				)
			);
			return;
		}

		setCancellationStatus( 'success' );
		dispatch(
			successNotice( translate( 'Migration cancellation request sent.' ), {
				duration: 5000,
			} )
		);
	};

	return (
		<div className="migration-started-difm__cancel-form">
			{ cancellationStatus === 'pending' && (
				<LoadingBar className="migration-started-difm__cancel-loading-bar" progress={ 0.5 } />
			) }
			{ cancellationStatus === null && (
				<Button
					variant="link"
					onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
						e.preventDefault();
						openModal();
					} }
				>
					{ translate( 'Request cancellation' ) }
				</Button>
			) }
			{ isOpen && (
				<Modal
					className="migration-started-difm__cancel-dialog"
					title={ translate( 'Request migration cancellation' ) }
					onRequestClose={ closeModal }
					size="medium"
				>
					<p>
						{ translate(
							"Since your migration is already underway, you'll need to send us a cancellation request. If you cancel now, you'll lose all your progress."
						) }
					</p>
					<div className="migration-started-difm__cancel-dialog-buttons">
						<Button key="cancel" variant="secondary" onClick={ () => closeModal() }>
							{ translate( "Don't cancel migration" ) }
						</Button>
						<Button key="send" variant="primary" onClick={ () => handleCancelMigration( siteId ) }>
							{ translate( 'Send request' ) }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
};

export default CancelDifmMigrationForm;
