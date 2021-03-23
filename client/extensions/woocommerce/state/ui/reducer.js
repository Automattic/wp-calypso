/**
 * Internal dependencies
 */
import payments from './payments/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import { combineReducers } from 'calypso/state/utils';

export default combineReducers( {
	payments,
	reviews,
	reviewReplies,
} );
