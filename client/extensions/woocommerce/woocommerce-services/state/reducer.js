/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * Internal dependencies
 */
import labelSettings from './label-settings/reducer';
import packages from './packages/reducer';
import shippingLabel from './shipping-label/reducer';
import shippingMethodSchemas from './shipping-method-schemas/reducer';
import shippingZoneMethodSettings from './shipping-zone-method-settings/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		labelSettings,
		packages,
		shippingLabel,
		shippingMethodSchemas,
		shippingZoneMethodSettings,
	} )
);
