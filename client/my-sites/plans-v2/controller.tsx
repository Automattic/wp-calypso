/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import SelectorPage from './selector';
import DetailsPage from './details';
import UpsellPage from './upsell';
import {
	stringToDuration,
	stringToDurationString,
	slugToSelectorProduct,
	durationToString,
} from './utils';

export const productSelect = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	const duration = stringToDuration( context.params.duration );
	context.primary = <SelectorPage defaultDuration={ duration } rootUrl={ rootUrl } />;
	next();
};

export const productDetails = ( rootUrl: string ) => (
	context: PageJS.Context,
	next: Function
) => {
	const productType: string = context.params.product;
	const durationString = stringToDurationString( context.params.duration );
	const product = slugToSelectorProduct( productType );

	// If the product slug does not parse to as product, send the user back to the selector page.
	if ( ! product ) {
		page.redirect( `${ rootUrl }/${ durationString }` );
		return;
	} else if ( ! product.subtypes.length ) {
		// Otherwise, if the product has no subtypes, send them to the upsell page.
		page.redirect( `${ rootUrl }/${ product.productSlug }/${ durationString }/additions` );
		return;
	}

	// We now know the product has subtypes, let the user select them.
	context.primary = <DetailsPage product={ product } rootUrl={ rootUrl } />;
	next();
};

export const productUpsell = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	const productSlug: string = context.params.product;
	const duration = stringToDuration( context.params.duration );
	const product = slugToSelectorProduct( productSlug );

	// If there is no duration, send the user back to the selector page.
	if ( ! duration ) {
		page.redirect( rootUrl );
		return;
	} else if ( ! product ) {
		// Else if the product cannot be parsed, send the user to the selector page with the duration.
		const durationString = durationToString( duration );
		page.redirect( `${ rootUrl }/${ durationString }` );
		return;
	}

	// Otherwise, show the upsell page.
	// We determine if there *is* an available upsell within this component.
	context.primary = <UpsellPage productSlug={ productSlug } rootUrl={ rootUrl } />;
	next();
};
