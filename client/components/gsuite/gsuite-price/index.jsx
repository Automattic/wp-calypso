import { Badge } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { getAnnualPrice, getMonthlyPrice } from 'calypso/lib/gsuite';

import './style.scss';

/**
 * Determines whether a discount can be applied to the specified product via a sales coupon.
 * @param {undefined|null|{sale_cost?: number, sale_coupon?:{start_date?: string; expires?: string}}} product - G Suite product
 * @returns {boolean} - true if a discount can be applied, false otherwise
 */
export const hasDiscount = ( product ) => {
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
	// Ensure that coupon start and end time are correctly converted to UTC times in the browser.
	// Use ISO 8601 format to avoid cross-browser issues - convert '2021-12-12 12:34:56' to '2021-12-12T12:34:56Z'
	const startDate = new Date( product.sale_coupon.start_date.replace( ' ', 'T' ) + 'Z' );
	const endDate = new Date( product.sale_coupon.expires.replace( ' ', 'T' ) + 'Z' );

	return currentTime >= startDate && currentTime <= endDate;
};

const GSuitePrice = ( { currencyCode, product } ) => {
	const translate = useTranslate();

	const cost = product?.cost ?? null;

	const annualPrice = getAnnualPrice( cost, currencyCode );
	const monthlyPrice = getMonthlyPrice( cost, currencyCode );

	const isDiscounted = hasDiscount( product );

	return (
		<div className="gsuite-price">
			<h4 className="gsuite-price__monthly-price">
				{ translate( '{{strong}}%(price)s{{/strong}} /user /month', {
					args: {
						price: monthlyPrice,
					},
					components: {
						strong: <strong />,
					},
					comment: "Monthly price per user formatted with the currency (e.g. '$8.40')",
				} ) }
			</h4>

			<h5
				className={ clsx( {
					'gsuite-price__annual-price': true,
					discounted: isDiscounted,
				} ) }
			>
				{ translate( '%(price)s billed annually', {
					args: {
						price: annualPrice,
					},
					comment: "Annual price formatted with the currency (e.g. '$99.99')",
				} ) }
			</h5>

			{ isDiscounted && (
				<Badge type="success">
					{ translate( '%(price)s for your first year', {
						args: {
							price: getAnnualPrice( product.sale_cost, currencyCode ),
						},
						comment: "Discounted annual price formatted with the currency (e.g. '$80')",
					} ) }
				</Badge>
			) }
		</div>
	);
};

GSuitePrice.propTypes = {
	currencyCode: PropTypes.string,
	product: PropTypes.object,
};

export default GSuitePrice;
