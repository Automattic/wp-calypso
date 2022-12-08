import { FormToggle } from '@wordpress/components';

import './styles.scss';

export type DoNotSellDialogProps = {
	content: {
		title: string;
		longDescription: React.ReactNode;
		toggleLabel: string;
		closeButton: string;
	};
	onClose: () => void;
	isActive?: boolean;
	onToggleActive: ( isActive: boolean ) => void;
};
export const DoNotSellDialog = ( {
	content,
	onClose,
	isActive,
	onToggleActive,
}: DoNotSellDialogProps ) => {
	const { title, longDescription, toggleLabel, closeButton } = content;
	return (
		<div
			className="do-not-sell"
			role="dialog"
			aria-modal="true"
			aria-labelledby="do-not-sell-title"
			aria-describedby="do-not-sell-description"
		>
			<div className="do-not-sell__overlay" />
			<div className="do-not-sell__dialog">
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
						onChange={ ( e ) => onToggleActive( e.currentTarget.checked ) }
						checked={ isActive }
					/>
					{ toggleLabel }
				</label>
				<div className="do-not-sell__footer">
					<button className="do-not-sell__button" onClick={ onClose }>
						{ closeButton }
					</button>
				</div>
			</div>
		</div>
	);
};
