import { Modal } from '@wordpress/components';
import React from 'react';
import './style.scss';

interface Props {
	isOpen: boolean;
	title: string;
	description: string;
	imageSrc: string;
	actionButtons: React.ReactElement;
	onClose: () => void;
}

const NuxModal: React.FC< Props > = ( {
	isOpen,
	title,
	description,
	imageSrc,
	actionButtons,
	onClose,
} ) => {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="wpcom-block-editor-nux-modal"
			open={ isOpen }
			title=""
			onRequestClose={ onClose }
		>
			<div className="wpcom-block-editor-nux-modal__image-container">
				<img src={ imageSrc } alt={ title } />
			</div>
			<h1 className="wpcom-block-editor-nux-modal__title">{ title }</h1>
			<p className="wpcom-block-editor-nux-modal__description">{ description }</p>
			<div className="wpcom-block-editor-nux-modal__buttons">{ actionButtons }</div>
		</Modal>
	);
};

export default NuxModal;
