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
 * Internal dependencies
 */
import Badge from 'components/badge';

export class PlanPrice extends Component {
	render() {
		const {
			currencyCode,
			rawPrice,
			original,
			discounted,
			className,
			isInSignup,
			isOnSale,
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

		const saleBadgeText = translate( 'Sale', {
			comment: 'Shown next to a domain that has a special discounted sale price',
		} );

		return (
			<h4 className={ classes }>
				<sup className="plan-price__currency-symbol">{ price.symbol }</sup>
				<span className="plan-price__integer">{ price.integer }</span>
				<sup className="plan-price__fraction">
					{ rawPrice - price.integer > 0 && price.fraction }
				</sup>
				{ taxText && (
					<sup className="plan-price__tax-amount">
						{ translate( '(+%(taxText)s tax)', { args: { taxText } } ) }
					</sup>
				) }
				{ isOnSale && <Badge>{ saleBadgeText }</Badge> }
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
	isOnSale: PropTypes.bool,
	taxText: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

PlanPrice.defaultProps = {
	currencyCode: 'USD',
	original: false,
	discounted: false,
	className: '',
	isOnSale: false,
};
