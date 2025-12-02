import './style.scss';

export default function ClientCheckoutPlaceholder() {
	return (
		<div className="client-checkout">
			<div className="client-checkout-placeholder">
				<div className="client-checkout-placeholder__main-content">
					<div className="client-checkout-placeholder__line" style={ { width: '50%' } }></div>
					<div className="client-checkout-placeholder__line" style={ { width: '70%' } }></div>
					<div className="client-checkout-placeholder__line" style={ { width: '50%' } }></div>
				</div>
				<div className="client-checkout-placeholder__sidebar-content">
					<div className="client-checkout-placeholder__line" style={ { width: '20%' } }></div>
					<div className="client-checkout-placeholder__line" style={ { width: '30%' } }></div>
				</div>
			</div>
		</div>
	);
}
