/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PricingPage from './main';

export function pricing( context: PageJS.Context, next: Function ) {
	context.primary = <PricingPage />;
	next();
}
