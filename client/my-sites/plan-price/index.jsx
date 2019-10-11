/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanPrice extends Component {
	render() {
		const {
			currencyCode,
			rawPrice,
			rawPriceRange,
			original,
			discounted,
			className,
			isInSignup,
			isOnSale,
			taxText,
			translate,
		} = this.props;

		let priceRange = false;
		if ( rawPrice && rawPrice !== 0 ) {
			priceRange = [
				{
					price: getCurrencyObject( rawPrice, currencyCode ),
					raw: rawPrice,
				},
			];
		}

		if (
			rawPriceRange &&
			rawPriceRange[ 0 ] &&
			rawPriceRange[ 1 ] &&
			rawPriceRange[ 0 ] !== 0 &&
			rawPriceRange[ 1 ] !== 0
		) {
			priceRange = [
				{
					price: getCurrencyObject( rawPriceRange[ 0 ], currencyCode ),
					raw: rawPriceRange[ 0 ],
				},
				{
					price: getCurrencyObject( rawPriceRange[ 1 ], currencyCode ),
					raw: rawPriceRange[ 1 ],
				},
			];
		}

		if ( ! currencyCode || ! priceRange ) {
			return null;
		}

		const classes = classNames( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted,
		} );

		const renderPrice = priceObj => {
			return [
				priceObj.price.integer,
				priceObj.raw - priceObj.price.integer > 0 && priceObj.price.fraction,
			];
		};

		if ( isInSignup ) {
			return (
				<span className={ classes }>
					{ priceRange[ 0 ].price.symbol }
					{ renderPrice( priceRange[ 0 ] ) }
					{ priceRange[ 1 ] && '-' }
					{ priceRange[ 1 ] && renderPrice( priceRange[ 1 ] ) }
				</span>
			);
		}

		const renderPriceHtml = priceObj => {
			return (
				<Fragment>
					<span className="plan-price__integer">{ priceObj.price.integer }</span>
					<sup className="plan-price__fraction">
						{ priceObj.raw - priceObj.price.integer > 0 && priceObj.price.fraction }
					</sup>
				</Fragment>
			);
		};

		const saleBadgeText = translate( 'Sale', {
			comment: 'Shown next to a domain that has a special discounted sale price',
		} );

		return (
			<h4 className={ classes }>
				<sup className="plan-price__currency-symbol">{ priceRange[ 0 ].price.symbol }</sup>
				{ renderPriceHtml( priceRange[ 0 ] ) }
				{ priceRange[ 1 ] && '-' }
				{ priceRange[ 1 ] && renderPriceHtml( priceRange[ 1 ] ) }
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
	rawPriceRange: PropTypes.array,
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
