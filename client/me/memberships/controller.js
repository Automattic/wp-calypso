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
