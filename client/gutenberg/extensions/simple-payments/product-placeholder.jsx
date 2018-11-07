/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './product-placeholder.scss';
import getAssetPath from 'gutenberg/extensions/presets/jetpack/utils/get-asset-path';

export default ( { title = '', content = '', formattedPrice = '', multiple = false } ) => (
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
								type="number"
								value="1"
								readOnly
							/>
						</div>
					) }
					<div className="jetpack-simple-payments-button">
						<img
							alt={ __( 'Pay with PayPal', 'jetpack' ) }
							src={ getAssetPath( 'paypal-button.png' ) }
							srcSet={ `${ getAssetPath( 'paypal-button.png' ) } ${ getAssetPath(
								'paypal-button@2x.png'
							) } 2x` }
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
);
