/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getAnnualPrice, getMonthlyPrice } from 'lib/gsuite';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Determines whether a discount can be applied to the specified product via a sales coupon.
 *
 * @param {object} product - G Suite product
 * @returns {boolean} - true if a discount can be applied, false otherwise
 */
const hasValidDiscount = ( product ) => {
	if (
		! product ||
		! product.sale_cost ||
		! product.sale_coupon ||
		! product.sale_coupon.start_date ||
		! product.sale_coupon.expires
	) {
		return false;
	}

	const currentTime = Date.now();
	const startDate = new Date( product.sale_coupon.start_date );
	const endDate = new Date( product.sale_coupon.expires );

	return currentTime >= startDate && currentTime <= endDate;
};

const GSuitePrice = ( { currencyCode, product } ) => {
	const translate = useTranslate();

	const cost = product?.cost ?? null;

	const annualPrice = getAnnualPrice( cost, currencyCode );
	const monthlyPrice = getMonthlyPrice( cost, currencyCode );

	if ( abtest( 'gsuitePrice' ) === 'discount' ) {
		const isDiscounted = hasValidDiscount( product );

		return (
			<div className="gsuite-price">
				<h4 className="gsuite-price__monthly-price">
					{ translate( '{{strong}}%(price)s{{/strong}} per user/month', {
						args: {
							price: monthlyPrice,
						},
						components: {
							strong: <strong />,
						},
						comment: "Monthly price per user formatted with the currency (e.g. '$8.40')",
					} ) }
				</h4>

				<h5 className={ classNames( {
					'gsuite-price__annual-price': true,
					'discounted': isDiscounted
				} ) }>
					{ translate( '%(price)s billed annually', {
						args: {
							price: annualPrice,
						},
						comment: "Annual price formatted with the currency (e.g. '$99.99')"
					} ) }
				</h5>

				{ isDiscounted && (
					<h6 className="gsuite-price__discounted-price">
						{ translate( '%(price)s for your first year', {
							args: {
								price: getAnnualPrice( product.sale_cost, currencyCode ),
							},
							comment: "Discounted annual price formatted with the currency (e.g. '$80')"
						} ) }
					</h6>
				) }
			</div>
		);
	}

	return (
		<div className="gsuite-price">
			<h4 className="gsuite-price__price-per-user-per-month">
				<span>
					{ translate( '{{strong}}%(price)s{{/strong}} per user / month', {
						components: {
							strong: <strong />,
						},
						args: {
							price: monthlyPrice,
						},
					} ) }
				</span>
			</h4>

			<h5 className="gsuite-price__price-per-user-per-year">
				{ translate( '%(price)s billed yearly', {
					args: {
						price: annualPrice,
					},
				} ) }
			</h5>
		</div>
	);
};

GSuitePrice.propTypes = {
	currencyCode: PropTypes.string,
	product: PropTypes.object,
};

export default GSuitePrice;
