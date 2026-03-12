import { Modal } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';
import useMinimizeHelpCenterOnMount from 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount';

import './style.scss';

type InfoModalProps = {
	title: string;
	onClose: () => void;
	children?: React.ReactNode;
	className?: string;
};

const InfoModal = ( { onClose, children, title, className }: InfoModalProps ) => {
	useMinimizeHelpCenterOnMount();

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
