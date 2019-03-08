/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal Dependencies
 **/
import config from 'config';

export class PlanPrice extends Component {
	render() {
		const {
			currencyCode,
			rawPrice,
			original,
			discounted,
			className,
			isInSignup,
			taxText,
			translate,
		} = this.props;
		if ( ! currencyCode || ( rawPrice !== 0 && ! rawPrice ) ) {
			return null;
		}
		const price = getCurrencyObject( rawPrice, currencyCode );
		const classes = classNames( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted,
		} );

		if ( isInSignup ) {
			return (
				<span className={ classes }>
					{ price.symbol }
					{ price.integer }
					{ rawPrice - price.integer > 0 && price.fraction }
				</span>
			);
		}

		return (
			<h4 className={ classes }>
				<sup className="plan-price__currency-symbol">{ price.symbol }</sup>
				<span className="plan-price__integer">{ price.integer }</span>
				<sup className="plan-price__fraction">
					{ rawPrice - price.integer > 0 && price.fraction }
				</sup>
				{ config.isEnabled( 'show-tax' ) && taxText && (
					<sup className="plan-price__tax-amount">
						{ translate( '(+%(taxText)s tax)', { args: { taxText } } ) }
					</sup>
				) }
			</h4>
		);
	}
}

export default localize( PlanPrice );

PlanPrice.propTypes = {
	rawPrice: PropTypes.number,
	original: PropTypes.bool,
	discounted: PropTypes.bool,
	currencyCode: PropTypes.string,
	className: PropTypes.string,
	taxText: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

PlanPrice.defaultProps = {
	currencyCode: 'USD',
	original: false,
	discounted: false,
	className: '',
};
