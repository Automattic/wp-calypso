/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Image from 'components/image';

/**
 * Style dependencies
 */
import './style.scss';

function CheckoutSeals( { guaranteeVisible } ) {
	const guaranteeClasses = classNames( 'checkout-seals__guarantee-seal', {
		'checkout-seals__guarantee-seal__hidden': ! guaranteeVisible,
	} );

	return (
		<>
			<div className="checkout-seals">
				<div className="checkout-seals__row">
					<div className="checkout-seals__trustpilot">
						<Image src="/calypso/images/upgrades/trustpilot-brand.svg" />
						<Image
							className="checkout-seals__trustpilot-rating"
							src="/calypso/images/upgrades/trustpilot-rating.svg"
						/>
					</div>
					<Image
						className="checkout-seals__security-seal"
						src="/calypso/images/upgrades/sectigo_trust_seal_md_2x.png"
					/>
				</div>
				<Image className={ guaranteeClasses } src="/calypso/images/upgrades/money-back.svg" />
			</div>
		</>
	);
}

CheckoutSeals.propTypes = {
	guaranteeVisible: PropTypes.bool,
};

export default CheckoutSeals;
