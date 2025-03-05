import { Modal } from '@wordpress/components';
import React from 'react';

import './style.scss';

type InfoModalProps = {
	title: string;
	onClose: () => void;
	children?: React.ReactNode;
};

const InfoModal = ( { onClose, children, title }: InfoModalProps ) => {
	return (
		<Modal
			className="consolidated-view-info-modal__wrapper"
			onRequestClose={ onClose }
			title={ title }
		>
			{ children }
		</Modal>
	);
};

export default InfoModal;
