import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, cloudDownload, cloudUpload } from '@wordpress/icons';
import SyncModal from '../staging-site-sync-modal';

interface SyncDropdownProps {
	className?: string;
	environment: 'production' | 'staging';
	siteSlug: string;
}

export default function SyncDropdown( { className, environment, siteSlug }: SyncDropdownProps ) {
	const [ isModalOpen, setIsModalOpen ] = useState< boolean >( false );
	const [ syncType, setSyncType ] = useState< 'pull' | 'push' >( 'pull' );

	const pullLabel =
		environment === 'staging' ? __( 'Pull from Production' ) : __( 'Pull from Staging' );
	const pushLabel =
		environment === 'staging' ? __( 'Push to Production' ) : __( 'Push to Staging' );

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
			{ isModalOpen && (
				<SyncModal
					onClose={ handleCloseModal }
					syncType={ syncType }
					environment={ environment }
					siteSlug={ siteSlug }
				/>
			) }
		</>
	);
}
