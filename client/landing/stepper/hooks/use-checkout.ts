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

		if ( products.length ) {
			openCheckoutModal( products, { redirect_to: destination } );
		} else {
			// If no products are provided, we might have added plan to the cart so we just go to the checkout page directly
			// The theme upsell link does not work with siteId and requires a siteSlug.
			// See https://github.com/Automattic/wp-calypso/pull/64899
			window.location.href = `/checkout/${ encodeURIComponent( siteSlug ) }?${ params }`;
		}
	};

	return { goToCheckout };
};

export default useCheckout;
