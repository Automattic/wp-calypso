import { getPlanByPathSlug } from '@automattic/calypso-products';

export const shouldRedirectToStepperFlow = ( flowName?: string ) => {
	if ( ! flowName ) {
		return null;
	}

	const plan = getPlanByPathSlug( flowName );

	if ( plan || flowName === 'free' ) {
		return `/setup/create-site?plan=${ flowName }`;
	}

	return null;
};
