/**
 * External dependencies
 */
import { __ } from '../../utils/i18n';

/**
 * Internal dependencies
 */
import './product-placeholder.scss';
import paypalImage from './paypal-button.png';
import paypalImage2x from './paypal-button-2x.png';

export default ( {
	title = '',
	content = '',
	formattedPrice = '',
	multiple = false,
	featuredMediaUrl = null,
	featuredMediaTitle = null,
} ) => (
	<div className="jetpack-simple-payments-wrapper">
		<div className="jetpack-simple-payments-product">
			{ featuredMediaUrl && (
				<div className="jetpack-simple-payments-product-image">
					<figure className="jetpack-simple-payments-image">
						<img src={ featuredMediaUrl } alt={ featuredMediaTitle } />
					</figure>
				</div>
			) }
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
