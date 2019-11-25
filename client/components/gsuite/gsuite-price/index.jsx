/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getAnnualPrice, getMonthlyPrice } from 'lib/gsuite';

/**
 * Style dependencies
 */
import './style.scss';

const GSuitePrice = ( { currencyCode, product } ) => {
	const translate = useTranslate();

	const cost = product?.cost ?? null;
	const annualPrice = cost && currencyCode ? getAnnualPrice( cost, currencyCode ) : '-';
	const monthlyPrice = cost && currencyCode ? getMonthlyPrice( cost, currencyCode ) : '-';

	return (
		<div className="gsuite-price">
			<h4 className="gsuite-price__price-per-user">
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

			<h5 className="gsuite-price__annual-price">
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
