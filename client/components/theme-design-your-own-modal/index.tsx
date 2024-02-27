import './style.scss';
import { Button, Modal } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { FC } from 'react';

const ThemeDesignYourOwnModal: FC< {
	isOpen: boolean;
	onClose: () => void;
	onCreateNewSite: () => void;
	onSelectSite: () => void;
} > = ( { isOpen, onClose, onCreateNewSite, onSelectSite } ) => {
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
			<p>
				{ translate( 'Choose the site you want to design a theme for.', {
					comment: 'TODO',
				} ) }
			</p>

			<div className="theme-design-your-own-modal__footer">
				<Button variant="primary" onClick={ onCreateNewSite }>
					{ translate( 'Create a new site', {
						comment: 'TODO',
					} ) }
				</Button>
				<Button variant="secondary" onClick={ onSelectSite }>
					{ translate( 'Select one of my sites', {
						comment: 'TODO',
					} ) }
				</Button>
			</div>
		</Modal>
	);
};

export default ThemeDesignYourOwnModal;
