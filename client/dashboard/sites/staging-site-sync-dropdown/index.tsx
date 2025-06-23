import { Dropdown, Button, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, cloudDownload, cloudUpload } from '@wordpress/icons';

interface SyncDropdownProps {
	className?: string;
	environment?: 'production' | 'staging';
}

export default function SyncDropdown( { className, environment }: SyncDropdownProps ) {
	const pullLabel =
		environment === 'staging' ? __( 'Pull from Production' ) : __( 'Pull from Staging' );
	const pushLabel =
		environment === 'staging' ? __( 'Push to Production' ) : __( 'Push to Staging' );

	return (
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
							} }
							icon={ cloudDownload }
							iconPosition="left"
						>
							{ pullLabel }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								onClose();
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
	);
}
