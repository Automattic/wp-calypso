/** @format */

/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Internal dependencies
 */
import './product-placeholder.scss';
import paypalImage from './paypal-button.png';
import paypalImage2x from './paypal-button@2x.png';

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
								readOnly
								type="number"
								value="1"
							/>
						</div>
					) }
					<div className="jetpack-simple-payments-button">
						<img
							alt={ __( 'Pay with PayPal' ) }
							src={ paypalImage }
							srcSet={ `${ paypalImage2x } 2x` }
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
);
