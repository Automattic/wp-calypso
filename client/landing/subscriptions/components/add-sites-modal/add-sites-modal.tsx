import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';

type AddSitesModalProps = {
	showModal: boolean;
	onClose: () => void;
	onAddFinished: () => void;
};

const AddSitesModal = ( { showModal, onClose, onAddFinished }: AddSitesModalProps ) => {
	const translate = useTranslate();

	const modalTitle = translate( 'Add sites', {
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
			<AddSitesForm
				recordTracksEvent={ recordTracksEvent }
				onClose={ onClose }
				onAddFinished={ onAddFinished }
			/>
		</Modal>
	);
};

export default AddSitesModal;
