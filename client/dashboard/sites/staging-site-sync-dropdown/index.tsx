import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, cloudDownload, cloudUpload } from '@wordpress/icons';
import QueryRewindState from '../../../components/data/query-rewind-state';
import { useFirstMatchingBackupAttempt } from '../../../my-sites/backup/hooks';
import SyncModal from '../staging-site-sync-modal';

interface SyncDropdownProps {
	className?: string;
	environment: 'production' | 'staging';
	siteSlug: string;
	productionSiteId: number;
	stagingSiteId: number;
}

export default function SyncDropdown( {
	className,
	environment,
	siteSlug,
	productionSiteId,
	stagingSiteId,
}: SyncDropdownProps ) {
	const [ isModalOpen, setIsModalOpen ] = useState< boolean >( false );
	const [ syncType, setSyncType ] = useState< 'pull' | 'push' >( 'pull' );

	const pullLabel =
		environment === 'staging' ? __( 'Pull from Production' ) : __( 'Pull from Staging' );
	const pushLabel =
		environment === 'staging' ? __( 'Push to Production' ) : __( 'Push to Staging' );

	const querySiteId =
		( environment === 'staging' && syncType === 'push' ) ||
		( environment === 'production' && syncType === 'pull' )
			? stagingSiteId
			: productionSiteId;

	const { backupAttempt: lastKnownBackupAttempt } = useFirstMatchingBackupAttempt( querySiteId, {
		sortOrder: 'desc',
		successOnly: true,
	} );
	const rewindId = lastKnownBackupAttempt?.rewindId;

	const handleOpenModal = ( type: 'pull' | 'push' ) => {
		setSyncType( type );
		setIsModalOpen( true );
	};

	const handleCloseModal = () => {
		setIsModalOpen( false );
	};

	return (
		<>
			<Dropdown
				className={ className }
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						icon={ chevronDown }
						iconPosition="right"
						variant="secondary"
						aria-expanded={ isOpen }
						onClick={ () => onToggle() }
					>
						{ __( 'Sync' ) }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<div>
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									onClose();
									handleOpenModal( 'pull' );
								} }
								icon={ cloudDownload }
								iconPosition="left"
							>
								{ pullLabel }
							</MenuItem>
							<MenuItem
								onClick={ () => {
									onClose();
									handleOpenModal( 'push' );
								} }
								icon={ cloudUpload }
								iconPosition="left"
							>
								{ pushLabel }
							</MenuItem>
						</MenuGroup>
					</div>
				) }
			/>
			{ isModalOpen && querySiteId > 0 && (
				<>
					<QueryRewindState siteId={ querySiteId } />
					<SyncModal
						onClose={ handleCloseModal }
						syncType={ syncType }
						environment={ environment }
						siteSlug={ siteSlug }
						productionSiteId={ productionSiteId }
						stagingSiteId={ stagingSiteId }
						querySiteId={ querySiteId }
						rewindId={ rewindId }
					/>
				</>
			) }
		</>
	);
}
