import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import './styles.scss';

type AddSitesModalProps = {
	showModal: boolean;
	onClose: () => void;
	onAddFinished: () => void;
};

const AddSitesModal = ( { showModal, onClose, onAddFinished }: AddSitesModalProps ) => {
	const translate = useTranslate();

	const modalTitle = translate( 'Add a site', {
		context: 'Modal title',
	} );

	if ( ! showModal ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitle as string }
			onRequestClose={ onClose }
			overlayClassName="add-sites-modal"
		>
			<p className="add-sites-modal__subtitle">
				{ translate( 'Subscribe to sites, newsletters, and RSS feeds.' ) }
			</p>

			<AddSitesForm onAddFinished={ onAddFinished } />
		</Modal>
	);
};

export default AddSitesModal;
