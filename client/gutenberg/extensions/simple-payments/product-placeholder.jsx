/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './view.scss';

export default ( { title = '', content = '', formattedPrice = '' } ) => {
	return (
		<div className="jetpack-simple-payments-wrapper">
			<div className="jetpack-simple-payments-product">
				<div className="jetpack-simple-payments-details">
					{ title ? (
						<div className="jetpack-simple-payments-title">
							<p>{ title }</p>
						</div>
					) : null }
					{ content ? (
						<div className="jetpack-simple-payments-description">
							<p>{ content }</p>
						</div>
					) : null }
					{ formattedPrice ? (
						<div className="jetpack-simple-payments-price">
							<p>{ formattedPrice }</p>
						</div>
					) : null }
					<div className="jetpack-simple-payments-purchase-box">
						<img src="paypal-placeholder.png" alt={ __( 'Pay with PayPal', 'jetpack' ) } />
					</div>
				</div>
			</div>
		</div>
	);
};
