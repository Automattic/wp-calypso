/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './view.scss';

export default ( { title = '', content = '', formattedPrice = '', multiple = false } ) => {
	const assetUrl =
		typeof window !== undefined && window.Jetpack_Block_Assets_Base_Url
			? window.Jetpack_Block_Assets_Base_Url
			: '/wp-content/plugins/jetpack/_inc/blocks';

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
						{ multiple ? (
							<div className="jetpack-simple-payments-items">
								<input className="jetpack-simple-payments-items-number" type="number" value="1" />
							</div>
						) : null }
						<img
							alt={ __( 'Pay with PayPal', 'jetpack' ) }
							src={ `${ assetUrl }paypal-button.png` }
							srcSet={ `${ assetUrl }paypal-button@2x.png 2x` }
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
