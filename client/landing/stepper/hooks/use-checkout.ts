import { openCheckoutModal } from 'calypso/my-sites/checkout/modal/utils';
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
	plan?: string;
	cancelDestination?: string;
	extraProducts?: string[];
	forceRedirection?: boolean;
}

const useCheckout = () => {
	const goToCheckout = ( {
		flowName,
		stepName,
		siteSlug,
		destination,
		plan,
		cancelDestination,
		extraProducts = [],
		forceRedirection = false,
	}: GoToCheckoutProps ) => {
		const relativeCurrentPath = window.location.href.replace( window.location.origin, '' );
		const params = new URLSearchParams( {
			redirect_to: destination,
			cancel_to: cancelDestination || relativeCurrentPath,
			signup: '1',
		} );

		persistSignupDestination( destination );
		setSignupCompleteSlug( siteSlug );
		setSignupCompleteFlowName( flowName );
		setSignupCompleteStepName( stepName );

		const products = [ ...( plan ? [ plan ] : [] ), ...extraProducts ];
		const hasProducts = products.length > 0;

		if ( hasProducts && ! forceRedirection ) {
			openCheckoutModal( products, { redirect_to: destination } );
		} else {
			// If no products are provided, we might have added plan to the cart so we just go to the checkout page directly.
			// If the flag forceRedirection is true, we also go to the checkout page via redirection.
			// The theme upsell link does not work with siteId and requires a siteSlug.
			// See https://github.com/Automattic/wp-calypso/pull/64899
			window.location.href = `/checkout/${ encodeURIComponent( siteSlug ) }${
				hasProducts ? `/${ products.join( ',' ) }` : ''
			}?${ params }`;
		}
	};

	return { goToCheckout };
};

export default useCheckout;
