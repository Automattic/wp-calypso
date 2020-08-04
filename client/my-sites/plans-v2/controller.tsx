/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SelectorPage from './selector';
import DetailsPage from './details';
import UpsellPage from './upsell';
import { stringToDuration } from './utils';

/**
 * Type dependencies
 */
import type PageJS from 'page';

export const productSelect = ( context: PageJS.Context, next: Function ) => {
	const duration = stringToDuration( context.params.duration );
	context.primary = <SelectorPage defaultDuration={ duration } />;
	next();
};

export const productDetails = ( context: PageJS.Context, next: Function ) => {
	const productType: string = context.params.product;
	const duration = stringToDuration( context.params.duration );
	context.primary = <DetailsPage productType={ productType } duration={ duration } />;
	next();
};

export const productUpsell = ( context: PageJS.Context, next: Function ) => {
	const productSlug: string = context.params.product;
	const duration = stringToDuration( context.params.duration );
	if ( ! duration ) {
		// TODO: Determine what to do here. Throw an error? Redirect the user?
		next();
		return;
	}
	context.primary = <UpsellPage productSlug={ productSlug } duration={ duration } />;
	next();
};
