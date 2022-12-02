import { FormToggle } from '@wordpress/components';

import './styles.scss';

export type DoNotSellDialogProps = {
	content: {
		title: string;
		longDescription: ( string | React.ReactNode )[];
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
}: DoNotSellDialogProps ) => (
	<div className="do-not-sell">
		<div className="do-not-sell__overlay" />
		<div className="do-not-sell__dialog">
			<div className="do-not-sell__header">
				<h3 className="do-not-sell__title">{ content.title }</h3>
				<button className="do-not-sell__close-button" onClick={ onClose } />
			</div>
			<div className="do-not-sell__content">
				{ content.longDescription.map( ( paragraph, index ) => (
					<p key={ `do-not-sell-${ index }` }>{ paragraph }</p>
				) ) }
			</div>
			<label className="do-not-sell__preference">
				<FormToggle
					className="do-not-sell__checkbox"
					onChange={ ( e ) => onToggleActive( e.currentTarget.checked ) }
					checked={ isActive }
				/>
				{ content.toggleLabel }
			</label>
			<div className="do-not-sell__footer">
				<button className="do-not-sell__button" onClick={ onClose }>
					{ content.closeButton }
				</button>
			</div>
		</div>
	</div>
);
