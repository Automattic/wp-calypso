/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

import './style.scss';

const WooCommercConnectCartHeader = ( { translate } ) => {
	return (
		<div className="woocommerce-connect-cart-header is-stepper">
			<div className="woocommerce-connect-cart-header__stepper">
				<div className="woocommerce-connect-cart-header__stepper-steps">
					<div className="woocommerce-connect-cart-header__stepper-step is-complete">
						<div className="woocommerce-connect-cart-header__stepper-step-icon">
							<span className="woocommerce-connect-cart-header__stepper-step-number">1</span>
							<svg
								role="img"
								aria-hidden="true"
								focusable="false"
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<mask
									id="mask0"
									mask-type="alpha"
									maskUnits="userSpaceOnUse"
									x="2"
									y="3"
									width="14"
									height="12"
								>
									<path
										d="M6.59631 11.9062L3.46881 8.77875L2.40381 9.83625L6.59631 14.0287L15.5963 5.02875L14.5388 3.97125L6.59631 11.9062Z"
										fill="white"
									/>
								</mask>
								<g mask="url(#mask0)">
									<rect width="18" height="18" fill="white" />
								</g>
							</svg>
						</div>
						<div className="woocommerce-connect-cart-header__stepper-step-text">
							<span className="woocommerce-connect-cart-header__stepper-step-label">
								{ translate( 'Cart' ) }
							</span>
						</div>
					</div>
					<div className="woocommerce-connect-cart-header__stepper-step-divider" />
					<div className="woocommerce-connect-cart-header__stepper-step is-active">
						<div className="woocommerce-connect-cart-header__stepper-step-icon">
							<span className="woocommerce-connect-cart-header__stepper-step-number">2</span>
						</div>
						<div className="woocommerce-connect-cart-header__stepper-step-text">
							<span className="woocommerce-connect-cart-header__stepper-step-label">
								{ translate( 'Payment' ) }
							</span>
						</div>
					</div>
					<div className="woocommerce-connect-cart-header__stepper-step-divider" />
					<div className="woocommerce-connect-cart-header__stepper-step">
						<div className="woocommerce-connect-cart-header__stepper-step-icon">
							<span className="woocommerce-connect-cart-header__stepper-step-number">3</span>
						</div>
						<div className="woocommerce-connect-cart-header__stepper-step-text">
							<span className="woocommerce-connect-cart-header__stepper-step-label">
								{ translate( 'Installation', { context: 'Navigation item' } ) }
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default localize( WooCommercConnectCartHeader );
