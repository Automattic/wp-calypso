/**
 * External dependencies
 */

import React from 'react';
import BillingHistoryComponent from './main';
import Subscription from './subscription';

export function myMemberships( context, next ) {
	context.primary = React.createElement( BillingHistoryComponent );
	next();
}

export function subscription( context, next ) {
	const subscriptionId = context.params.subscriptionId;

	if ( subscriptionId ) {
		context.primary = React.createElement( Subscription, { subscriptionId: subscriptionId } );
	}
	next();
}
