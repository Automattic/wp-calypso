/** @format */

/**
 * External dependencies
 */

import React from 'react';
import BillingHistoryComponent from './main';

export function myMemberships( context, next ) {
	context.primary = React.createElement( BillingHistoryComponent );
	next();
}

// export function subscription( context, next ) {
// 	const subscriptionId = context.params.subscriptionId;
//
// 	if ( subscriptionId ) {
// 		context.primary = React.createElement( Receipt, { subscriptionId } );
// 	}
// 	next();
// }
