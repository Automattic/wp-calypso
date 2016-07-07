/**
 * External dependencies
 */
import map from 'lodash/map';
import head from 'lodash/head';
import property from 'lodash/property';

export const findCurrencyFromPlans = plans => head(
	map(
		plans,
		property( 'currency_code' )
	)
) || 'USD';
