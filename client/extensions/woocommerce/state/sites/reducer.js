/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import coupons from './coupons/reducer';
import customers from './customers/reducer';
import data from './data/reducer';
import meta from './meta/reducer';
import orders from './orders/reducer';
import paymentMethods from './payment-methods/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import setupChoices from './setup-choices/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const reducer = combineReducers( {
	coupons,
	customers,
	data,
	meta,
	orders,
	paymentMethods,
	reviews,
	reviewReplies,
	setupChoices,
	settings,
	status,
} );

export default keyedReducer( 'siteId', reducer );
