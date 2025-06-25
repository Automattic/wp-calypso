import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SOURCE_SUBSCRIPTIONS_ADD_SITES_MODAL } from 'calypso/landing/subscriptions/tracks/constants';
import './styles.scss';

type AddSitesModalProps = {
	showModal: boolean;
	onClose: () => void;
	onChangeSubscribe: () => void;
};

const AddSitesModal = ( { showModal, onClose, onChangeSubscribe }: AddSitesModalProps ) => {
	const translate = useTranslate();

	const modalTitle = translate( 'Add a New Subscription', {
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
			focusOnMount="firstContentElement"
		>
			<p className="add-sites-modal__subtitle">
				{ translate( 'Subscribe to sites, newsletters, and RSS feeds.' ) }
			</p>

			<AddSitesForm
				onChangeSubscribe={ onChangeSubscribe }
				source={ SOURCE_SUBSCRIPTIONS_ADD_SITES_MODAL }
			/>
		</Modal>
	);
};

export default AddSitesModal;
