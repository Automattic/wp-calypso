/** @format */

/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Internal dependencies
 */
import './product-placeholder.scss';

export default ( { title = '', content = '', formattedPrice = '', multiple = false } ) => {
	const assetUrl =
		typeof window !== undefined && window.Jetpack_Block_Assets_Base_Url
			? window.Jetpack_Block_Assets_Base_Url
			: '/wp-content/plugins/jetpack/_inc/blocks';

	return (
		<div className="jetpack-simple-payments-wrapper">
			<div className="jetpack-simple-payments-product">
				<div className="jetpack-simple-payments-details">
					{ title && (
						<div className="jetpack-simple-payments-title">
							<p>{ title }</p>
						</div>
					) }
					{ content && (
						<div className="jetpack-simple-payments-description">
							<p>{ content }</p>
						</div>
					) }
					{ formattedPrice && (
						<div className="jetpack-simple-payments-price">
							<p>{ formattedPrice }</p>
						</div>
					) }
					<div className="jetpack-simple-payments-purchase-box">
						{ multiple && (
							<div className="jetpack-simple-payments-items">
								<input
									className="jetpack-simple-payments-items-number"
									readOnly
									type="number"
									value="1"
								/>
							</div>
						) }
						<div className="jetpack-simple-payments-button">
							<img
								alt={ __( 'Pay with PayPal' ) }
								src={ `${ assetUrl }paypal-button.png` }
								srcSet={ `${ assetUrl }paypal-button@2x.png 2x` }
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
