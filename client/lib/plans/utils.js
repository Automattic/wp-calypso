/**
 * External dependencies
 */

import { map, head, property } from 'lodash';

export const findCurrencyFromPlans = ( plans ) =>
	head( map( plans, property( 'currency_code' ) ) ) || 'USD';
