import { addQueryArgs } from '@wordpress/url';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteStepName,
} from 'calypso/signup/storageUtils';

interface GoToCheckoutProps {
	flowName: string;
	stepName: string;
	siteSlug: string;
	destination: string;
	from?: string;
	plan?: string;
	cancelDestination?: string;
	extraProducts?: string[];
	forceRedirection?: boolean;
	extraQueryParams?: Record< string, string >;
}

export const goToCheckout = ( {
	flowName,
	stepName,
	siteSlug,
	destination,
	plan,
	cancelDestination,
	extraProducts = [],
	extraQueryParams: extraParams = {},
}: GoToCheckoutProps ) => {
	const relativeCurrentPath = window.location.href.replace( window.location.origin, '' );
	const params = {
		redirect_to: destination,
		cancel_to: cancelDestination || relativeCurrentPath,
		signup: '1',
		...extraParams,
	};

	persistSignupDestination( destination );
	setSignupCompleteSlug( siteSlug );
	setSignupCompleteFlowName( flowName );
	setSignupCompleteStepName( stepName );

	const products = [ ...( plan ? [ plan ] : [] ), ...extraProducts ];
	const productSlugs = products.length > 0 ? `/${ products.join( ',' ) }` : '';

	// If no products are provided, we might have added plan to the cart so we just go to the checkout page directly.
	// If the flag forceRedirection is true, we also go to the checkout page via redirection.
	// The theme upsell link does not work with siteId and requires a siteSlug.
	// See https://github.com/Automattic/wp-calypso/pull/64899
	window.location.href = addQueryArgs(
		`/checkout/${ encodeURIComponent( siteSlug ) }${ productSlugs }`,
		params
	);
};
