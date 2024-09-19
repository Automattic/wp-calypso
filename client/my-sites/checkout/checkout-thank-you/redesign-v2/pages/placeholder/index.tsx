import './style.scss';

export const PlaceholderThankYou = () => {
	return (
		<div className="congrats-placeholder">
			<div className="congrats-placeholder__title" />
			<div className="congrats-placeholder__description" />
			<div className="congrats-placeholder__items">
				{ Array.from( { length: 2 } ).map( ( _, index ) => (
					<div key={ index } className="congrats-placeholder__item">
						<div className="congrats-placeholder__item-body">
							<div className="congrats-placeholder__item-title" />
							<div className="congrats-placeholder__item-description" />
						</div>
						<div className="congrats-placeholder__item-buttons" />
					</div>
				) ) }
			</div>
			<div className="congrats-placeholder__footer">
				{ Array.from( { length: 2 } ).map( ( _, index ) => (
					<div key={ index } className="congrats-placeholder__footer-item">
						<div className="congrats-placeholder__footer-item-title" />
						<div className="congrats-placeholder__footer-item-description congrats-placeholder__footer-item-description--m" />
						<div className="congrats-placeholder__footer-item-description congrats-placeholder__footer-item-description--l" />
						<div className="congrats-placeholder__footer-item-description congrats-placeholder__footer-item-description--s" />
						<div className="congrats-placeholder__footer-item-description congrats-placeholder__footer-item-description--s" />
					</div>
				) ) }
			</div>
		</div>
	);
};
