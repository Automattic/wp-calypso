import { isEnabled } from '@automattic/calypso-config';
import { AddSubscriberForm } from '@automattic/subscriber';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type AddSubscribersModalProps = {
	siteId: number;
	showModal: boolean;
	onClose: () => void;
	onAddFinished: () => void;
};

const AddSubscribersModal = ( {
	siteId,
	showModal,
	onClose,
	onAddFinished,
}: AddSubscribersModalProps ) => {
	const translate = useTranslate();
	const title = translate( 'Add subscribers' );

	return (
		<>
			{ showModal && (
				<Modal title={ title } onRequestClose={ onClose }>
					<AddSubscriberForm
						siteId={ siteId }
						submitBtnAlwaysEnable={ true }
						onImportFinished={ onAddFinished }
						showTitle={ false }
						showSubtitle={ false }
						showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
					/>
				</Modal>
			) }
		</>
	);
};

export default AddSubscribersModal;
