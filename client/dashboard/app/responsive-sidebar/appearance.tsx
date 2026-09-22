import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { styles } from '@wordpress/icons';
import { useState } from 'react';
import AppearanceControl from '../../components/appearance-control';

export default function SidebarAppearance() {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<div className="dashboard-responsive-sidebar__appearance">
			<Button
				variant="tertiary"
				icon={ styles }
				__next40pxDefaultSize
				aria-haspopup="dialog"
				onClick={ () => setIsOpen( true ) }
			>
				{ __( 'Appearance' ) }
			</Button>
			{ isOpen && (
				<Modal
					title={ __( 'Appearance' ) }
					size="small"
					onRequestClose={ () => setIsOpen( false ) }
				>
					<AppearanceControl source="sidebar_appearance" />
				</Modal>
			) }
		</div>
	);
}
