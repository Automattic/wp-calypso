import { Button, Modal } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { FC } from 'react';

const ThemeDesignYourOwnModal: FC< {
	handleOpenSiteSelector: () => void;
	isOpen: boolean;
	onClose: () => void;
} > = ( { handleOpenSiteSelector, isOpen, onClose } ) => {
	// const handleCreateSite = () => {
	// 	// Logic for creating a new site
	// };

	// const handleCloseModal = () => {
	// 	setShowModal( false );
	// };

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="theme-design-your-own-modal"
			onRequestClose={ onClose }
			size="medium"
			title={ translate( 'Design your own theme', {
				comment: 'TODO',
				textOnly: true,
			} ) }
		>
			<p>Choose the site you want to design a theme for.</p>

			<div>
				<Button variant="primary" onClick={ () => {} }>
					Create a new site
				</Button>
				<Button variant="secondary" onClick={ handleOpenSiteSelector }>
					Select one of my sites
				</Button>
			</div>
		</Modal>
	);
};

export default ThemeDesignYourOwnModal;
