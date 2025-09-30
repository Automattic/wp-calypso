import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';

import './style.scss';

type InfoModalProps = {
	title: string;
	onClose: () => void;
	children?: React.ReactNode;
	className?: string;
};

const InfoModal = ( { onClose, children, title, className }: InfoModalProps ) => {
	return (
		<Modal
			className={ clsx( 'a4a-info-modal', className ) }
			onRequestClose={ onClose }
			title={ title }
		>
			{ children }
		</Modal>
	);
};

export default InfoModal;
