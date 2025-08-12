import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LeaveSiteModalForm from './leave-site-modal-form';
import type { ComponentProps } from 'react';

const noop = () => {};

const LeaveSiteModal = ( props: ComponentProps< typeof LeaveSiteModalForm > ) => {
	const translate = useTranslate();

	return (
		<Modal
			className="leave-site-modal"
			title={ translate( 'Leave site' ) }
			size="small"
			__experimentalHideHeader
			onRequestClose={ props.onClose || noop }
		>
			<LeaveSiteModalForm { ...props } />
		</Modal>
	);
};

export default LeaveSiteModal;
