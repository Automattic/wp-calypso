/**
 * Internal dependencies
 */
import orders from './orders/reducer';
import payments from './payments/reducer';
import productCategories from './product-categories/reducer';
import products from './products/reducer';
import reviewReplies from './review-replies/reducer';
import reviews from './reviews/reducer';
import shipping from './shipping/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	orders,
	payments,
	products,
	productCategories,
	reviews,
	reviewReplies,
	shipping,
} );
