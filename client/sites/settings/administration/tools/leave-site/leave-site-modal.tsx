import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LeaveSiteModalForm, { LeaveSiteModalFormProps } from './leave-site-modal-form';

interface LeaveSiteModalProps extends LeaveSiteModalFormProps {}

const noop = () => {};

const LeaveSiteModal = ( props: LeaveSiteModalProps ) => {
	const translate = useTranslate();

	return (
		<Modal
			className="leave-site-modal"
			title={ translate( 'Leave site' ) }
			size="small"
			onRequestClose={ props.onClose || noop }
		>
			<LeaveSiteModalForm { ...props } />
		</Modal>
	);
};

export default LeaveSiteModal;
