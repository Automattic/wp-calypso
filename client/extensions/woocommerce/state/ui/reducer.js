/**
 * Internal dependencies
 */

import orders from './orders/reducer';
import payments from './payments/reducer';
import products from './products/reducer';
import productCategories from './product-categories/reducer';
import promotions from './promotions/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import shipping from './shipping/reducer';
import { combineReducers } from 'calypso/state/utils';

export default combineReducers( {
	orders,
	payments,
	products,
	productCategories,
	promotions,
	reviews,
	reviewReplies,
	shipping,
} );
