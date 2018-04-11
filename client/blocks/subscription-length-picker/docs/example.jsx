/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import { PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS } from 'lib/plans/constants';
import { SubscriptionLengthPicker } from 'blocks/subscription-length-picker';
import PropTypes from 'prop-types';

const productsWithPrices = [
	{
		planSlug: PLAN_BUSINESS,
		plan: getPlan( PLAN_BUSINESS ),
		// These prices should not be hardcoded in real code, this is just to
		// show how things will look like in devdocs
		priceFull: 200,
		priceMonthly: 200 / 24,
	},
	{
		planSlug: PLAN_BUSINESS_2_YEARS,
		plan: getPlan( PLAN_BUSINESS_2_YEARS ),
		// These prices should not be hardcoded in real code, this is just to
		// show how things will look like in devdocs
		priceFull: 380,
		priceMonthly: 380 / 48,
	},
];

const SubscriptionLengthPickerExample = () => (
	<div>
		<SubscriptionLengthPicker
			currencyCode="USD"
			productsWithPrices={ productsWithPrices }
			initialValue={ PLAN_BUSINESS_2_YEARS }
			translate={ x => x }
		/>
	</div>
);

SubscriptionLengthPickerExample.displayName = 'SubscriptionLengthPicker';

export default SubscriptionLengthPickerExample;
