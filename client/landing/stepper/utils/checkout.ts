import { Visibility } from '@automattic/data-stores';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteStepName,
} from 'calypso/signup/storageUtils';

export const goToUnifiedCheckout = ( {
	flowName,
	plan,
	userIsLoggedIn,
	destination,
	cancelDestination,
	siteIntent,
	extraQueryParams = {},
}: {
	flowName: string;
	plan: string;
	userIsLoggedIn: boolean;
	destination: string;
	cancelDestination: string;
	siteIntent?: string;
	extraQueryParams?: Record< string, string >;
} ) => {
	const siteParams = {
		blog_name: '',
		blog_title: translate( 'My Site' ),
		public: Visibility.PublicNotIndexed,
		options: {
			site_creation_flow: flowName,
			wpcom_public_coming_soon: 1,
			...( siteIntent && { site_intent: siteIntent } ),
		},
		find_available_url: true,
		validate: false,
	};

	try {
		window.localStorage.setItem( 'siteParams', JSON.stringify( siteParams ) );
	} catch {
		// Checkout can use its default site settings when storage is unavailable.
	}

	setSignupCompleteFlowName( flowName );
	persistSignupDestination( destination );

	window.location.assign(
		addQueryArgs( `/checkout/unified/${ encodeURIComponent( plan ) }`, {
			...extraQueryParams,
			flow: flowName,
			redirect_to: destination,
			cancel_to: cancelDestination,
			...( ! userIsLoggedIn && { signup: 1 } ),
		} )
	);
};

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
	historyBack?: boolean;
}

export const goToCheckout = ( {
	flowName,
	stepName,
	siteSlug,
	destination,
	plan,
	cancelDestination,
	extraProducts = [],
	historyBack = false,
	extraQueryParams: extraParams = {},
}: GoToCheckoutProps ) => {
	const relativeCurrentPath = window.location.href.replace( window.location.origin, '' );
	const params = {
		redirect_to: destination,
		cancel_to: cancelDestination || relativeCurrentPath,
		signup: '1',
		...( historyBack && { history_back: '1' } ),
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
	window.location.replace(
		addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }${ productSlugs }`, params )
	);
};
