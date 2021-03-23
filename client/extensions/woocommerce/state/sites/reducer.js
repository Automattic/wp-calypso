/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import data from './data/reducer';
import meta from './meta/reducer';
import paymentMethods from './payment-methods/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import setupChoices from './setup-choices/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const reducer = combineReducers( {
	data,
	meta,
	paymentMethods,
	reviews,
	reviewReplies,
	setupChoices,
	settings,
	status,
} );

export default keyedReducer( 'siteId', reducer );
