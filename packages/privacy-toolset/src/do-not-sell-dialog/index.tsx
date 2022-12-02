import { FormToggle } from '@wordpress/components';
import type { ChangeEvent } from 'react';
import './styles.scss';

export type DoNotSellDialogProps = {
	title: string;
	content: ( string | React.ReactNode )[];
	toggleLabel: string;
	closeButtonText: string;
	onClose: () => void;
	isDoNotSellActive?: boolean;
	onToggleDoNotSellSetting: ( isDoNotSellActive: boolean ) => void;
};
export const DoNotSellDialog = ( {
	title,
	content,
	toggleLabel,
	closeButtonText,
	onClose,
	isDoNotSellActive,
	onToggleDoNotSellSetting,
}: DoNotSellDialogProps ) => {
	const handleChange = ( ev: ChangeEvent< HTMLInputElement > ) => {
		onToggleDoNotSellSetting( ev.target.checked );
	};

	return (
		<div className="do-not-sell">
			<div className="do-not-sell__overlay" />
			<div className="do-not-sell__dialog">
				<div className="do-not-sell__header">
					<h3 className="do-not-sell__title">{ title }</h3>
					<button className="do-not-sell__close-button" onClick={ onClose } />
				</div>
				<div className="do-not-sell__content">
					{ content.map( ( paragraph ) => (
						<p>{ paragraph }</p>
					) ) }
				</div>
				<label className="do-not-sell__preference">
					<FormToggle
						className="do-not-sell__checkbox"
						onChange={ handleChange }
						checked={ isDoNotSellActive }
					/>
					{ toggleLabel }
				</label>
				<div className="do-not-sell__footer">
					<button className="do-not-sell__button" onClick={ onClose }>
						{ closeButtonText }
					</button>
				</div>
			</div>
		</div>
	);
};
