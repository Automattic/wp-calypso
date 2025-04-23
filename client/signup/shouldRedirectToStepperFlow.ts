import { getPlanByPathSlug } from '@automattic/calypso-products';
import { Context } from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';

export const shouldRedirectToStepperFlow = ( context: Context ) => {
	const { flowName } = context.params;

	if ( ! flowName ) {
		return null;
	}

	const plan = getPlanByPathSlug( flowName );

	if ( plan || flowName === 'free' ) {
		return addQueryArgs( '/setup/create-site', {
			...context.query,
			plan: flowName,
		} );
	}

	return null;
};
