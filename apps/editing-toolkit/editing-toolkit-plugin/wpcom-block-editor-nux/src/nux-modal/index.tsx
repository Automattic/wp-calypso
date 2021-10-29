import { Modal } from '@wordpress/components';
import classnames from 'classnames';
import React from 'react';
import './style.scss';

interface Props {
	isOpen: boolean;
	className?: string;
	title: string;
	description: string;
	imageSrc?: string;
	actionButtons: React.ReactElement;
	onRequestClose: () => void;
}

const NuxModal: React.FC< Props > = ( {
	isOpen,
	className,
	title,
	description,
	imageSrc,
	actionButtons,
	onRequestClose,
} ) => {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className={ classnames( 'wpcom-block-editor-nux-modal', className ) }
			open={ isOpen }
			title=""
			onRequestClose={ onRequestClose }
		>
			{ imageSrc && (
				<div className="wpcom-block-editor-nux-modal__image-container">
					<img src={ imageSrc } alt={ title } />
				</div>
			) }
			<h1 className="wpcom-block-editor-nux-modal__title">{ title }</h1>
			<p className="wpcom-block-editor-nux-modal__description">{ description }</p>
			<div className="wpcom-block-editor-nux-modal__buttons">{ actionButtons }</div>
		</Modal>
	);
};

export default NuxModal;
