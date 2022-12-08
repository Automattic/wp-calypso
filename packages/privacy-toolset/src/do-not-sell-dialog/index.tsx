import { FormToggle } from '@wordpress/components';
import { FormEventHandler } from 'react';
import Modal from 'react-modal';

import './styles.scss';

export type DoNotSellDialogProps = {
	content: {
		title: string;
		longDescription: React.ReactNode;
		toggleLabel: string;
		closeButton: string;
	};
	isOpen: boolean;
	onClose: () => void;
	isActive?: boolean;
	onToggleActive: ( isActive: boolean ) => void;
};
export const DoNotSellDialog = ( {
	content,
	isOpen,
	onClose,
	isActive,
	onToggleActive,
}: DoNotSellDialogProps ) => {
	const { title, longDescription, toggleLabel, closeButton } = content;
	const onFormToggleChange: FormEventHandler< HTMLInputElement > = ( e ) =>
		onToggleActive( e.currentTarget.checked );
	return (
		<Modal
			className="do-not-sell__dialog"
			overlayClassName="do-not-sell__overlay"
			aria={ {
				modal: true,
				labelledby: 'do-not-sell-title',
			} }
			onRequestClose={ onClose }
			isOpen={ isOpen }
		>
			<div className="do-not-sell__header">
				<h3 className="do-not-sell__title" id="do-not-sell-title">
					{ title }
				</h3>
				<button
					className="do-not-sell__close-button"
					aria-label="Close dialog"
					onClick={ onClose }
				/>
			</div>
			<div className="do-not-sell__content" id="do-not-sell-description">
				{ longDescription }
			</div>
			<label className="do-not-sell__preference">
				<FormToggle
					className="do-not-sell__checkbox"
					onChange={ onFormToggleChange }
					checked={ isActive }
				/>
				{ toggleLabel }
			</label>
			<div className="do-not-sell__footer">
				<button className="do-not-sell__button" onClick={ onClose }>
					{ closeButton }
				</button>
			</div>
		</Modal>
	);
};
