/** @format */

/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import labelSettings from './label-settings/reducer';
import packages from './packages/reducer';
import shippingLabel from './shipping-label/reducer';
import shippingMethodSchemas from './shipping-method-schemas/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		labelSettings,
		packages,
		shippingLabel,
		shippingMethodSchemas,
	} )
);
