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

const GSuitePrice = ( { cost, currencyCode, showMonthlyPrice } ) => {
	const translate = useTranslate();

	const annualPrice = cost && currencyCode ? getAnnualPrice( cost, currencyCode ) : '-';
	const monthlyPrice = cost && currencyCode ? getMonthlyPrice( cost, currencyCode ) : '-';

	const renderPerUserPerYear = () => {
		return translate( '{{strong}}%(price)s{{/strong}} per user / year', {
			components: {
				strong: <strong />,
			},
			args: {
				price: annualPrice,
			},
		} );
	};

	const renderPerUserPerMonth = () => {
		return translate( '{{strong}}%(price)s{{/strong}} per user / month', {
			components: {
				strong: <strong />,
			},
			args: {
				price: monthlyPrice,
			},
		} );
	};

	return (
		<div className="gsuite-price">
			<h4 className="gsuite-price__price-per-user">
				<span>{ showMonthlyPrice ? renderPerUserPerMonth() : renderPerUserPerYear() }</span>
			</h4>
			{ showMonthlyPrice && (
				<h5 className="gsuite-price__annual-price">
					{ translate( '%(price)s billed yearly', {
						args: {
							price: annualPrice,
						},
					} ) }
				</h5>
			) }
		</div>
	);
};

GSuitePrice.propTypes = {
	cost: PropTypes.number,
	currencyCode: PropTypes.string,
	showMonthlyPrice: PropTypes.bool.isRequired,
};

GSuitePrice.defaultProps = {
	showMonthlyPrice: false,
};

export default GSuitePrice;
