import './style.scss';

export default function ClientCheckoutV2Placeholder() {
	return (
		<div className="client-checkout-v2">
			<div className="client-checkout-v2-placeholder">
				<div className="client-checkout-v2-placeholder__main-content">
					<div className="client-checkout-v2-placeholder__line" style={ { width: '50%' } }></div>
					<div className="client-checkout-v2-placeholder__line" style={ { width: '70%' } }></div>
					<div className="client-checkout-v2-placeholder__line" style={ { width: '50%' } }></div>
				</div>
				<div className="client-checkout-v2-placeholder__sidebar-content">
					<div className="client-checkout-v2-placeholder__line" style={ { width: '20%' } }></div>
					<div className="client-checkout-v2-placeholder__line" style={ { width: '30%' } }></div>
				</div>
			</div>
		</div>
	);
}
