/**
 * Internal dependencies
 */

import orders from './orders/reducer';
import payments from './payments/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import { combineReducers } from 'calypso/state/utils';

export default combineReducers( {
	orders,
	payments,
	reviews,
	reviewReplies,
} );
