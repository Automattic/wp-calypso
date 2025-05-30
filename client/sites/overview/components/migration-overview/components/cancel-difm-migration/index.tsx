import { Modal, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingBar } from 'calypso/components/loading-bar';
import wp from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useSiteMigrationStatus } from './use-site-migration-status';

type CancelMigrationButtonProps = {
	isMigrationInProgress: boolean;
	onClick: () => void;
	buttonType: 'cta' | 'confirm';
	variant?: 'link' | 'primary' | 'secondary' | 'tertiary' | undefined;
	key?: string;
};

const CancelMigrationButton = ( {
	isMigrationInProgress,
	onClick,
	buttonType,
	...buttonProps
}: CancelMigrationButtonProps ) => {
	const translate = useTranslate();

	let cancelMigrationButtonText = translate( 'Cancel migration' );

	if ( buttonType === 'cta' && isMigrationInProgress ) {
		cancelMigrationButtonText = translate( 'Request migration cancellation' );
	}

	if ( buttonType === 'confirm' && isMigrationInProgress ) {
		cancelMigrationButtonText = translate( 'Send request' );
	}

	return (
		<Button
			onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
				e.preventDefault();
				onClick();
			} }
			{ ...buttonProps }
		>
			{ cancelMigrationButtonText }
		</Button>
	);
};

const CancelMigrationModal = ( {
	closeModal,
	handleCancelMigration,
	siteId,
	isMigrationInProgress,
}: {
	closeModal: () => void;
	handleCancelMigration: ( siteId: number ) => void;
	siteId: number;
	isMigrationInProgress: boolean;
} ) => {
	const translate = useTranslate();

	const modalTitle = ! isMigrationInProgress
		? translate( 'Cancel migration' )
		: translate( 'Request migration cancellation' );

	const modalContent = ! isMigrationInProgress
		? translate(
				"If you cancel now, our Happiness Engineers will be notified that you've chosen not to move your site to WordPress.com, and your current site will remain exactly as it is."
		  )
		: translate(
				"Since your migration is already underway, you'll need to send us a cancellation request. If you cancel now, you'll lose all your progress."
		  );

	return (
		<Modal
			className="migration-started-difm__cancel-dialog"
			title={ modalTitle }
			onRequestClose={ closeModal }
			size="medium"
		>
			<p>{ modalContent }</p>
			<div className="migration-started-difm__cancel-dialog-buttons">
				<Button key="cancel" variant="secondary" onClick={ () => closeModal() }>
					{ translate( "Don't cancel migration" ) }
				</Button>
				<CancelMigrationButton
					key="send"
					variant="primary"
					isMigrationInProgress={ isMigrationInProgress }
					onClick={ () => handleCancelMigration( siteId ) }
					buttonType="confirm"
				/>
			</div>
		</Modal>
	);
};

const CancelDifmMigrationForm = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	const [ cancellationStatus, setCancellationStatus ] = useState<
		'pending' | 'error' | 'success' | null
	>( null );

	const { site, isMigrationCompleted, isMigrationInProgress } = useSiteMigrationStatus( siteId );

	if ( ! site ) {
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

		const cancellationSuccessMessage = isMigrationInProgress
			? translate( 'Migration cancellation request sent.' )
			: translate( 'Migration cancelled.' );

		setCancellationStatus( 'success' );
		dispatch(
			successNotice( cancellationSuccessMessage, {
				duration: 5000,
			} )
		);
	};

	return (
		<div className="migration-started-difm__cancel-form">
			{ cancellationStatus === 'pending' && (
				<LoadingBar className="migration-started-difm__cancel-loading-bar" progress={ 0.5 } />
			) }
			{ ! isMigrationCompleted && cancellationStatus === null && (
				<CancelMigrationButton
					isMigrationInProgress={ isMigrationInProgress }
					onClick={ openModal }
					buttonType="cta"
					variant="link"
				/>
			) }
			{ isOpen && (
				<CancelMigrationModal
					closeModal={ closeModal }
					handleCancelMigration={ handleCancelMigration }
					siteId={ siteId }
					isMigrationInProgress={ isMigrationInProgress }
				/>
			) }
		</div>
	);
};

export default CancelDifmMigrationForm;
