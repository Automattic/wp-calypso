/** @format */

/**
 * Internal dependencies
 */

import productListSchema from './schema';
import { keyedReducer } from 'state/utils';
import crudReducer from 'state/crud/reducer';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site roles.
 */
export default keyedReducer(
	'siteId',
	crudReducer( {
		path: 'simplePayments.productList',
		getId: item => item.ID,
		schema: productListSchema,
	} )
);
