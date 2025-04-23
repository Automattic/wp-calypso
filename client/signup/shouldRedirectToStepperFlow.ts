import { getPlanByPathSlug } from '@automattic/calypso-products';
import { Context } from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';

const withLocale = ( url: string, locale?: string ) => {
	if ( ! locale ) {
		return url;
	}

	return `${ url }/${ locale }`;
};

export const shouldRedirectToStepperFlow = ( context: Context ) => {
	const { flowName, lang } = context.params;

	if ( ! flowName ) {
		return null;
	}

	const plan = getPlanByPathSlug( flowName );

	if ( plan || flowName === 'free' ) {
		const stepperFlow = withLocale( '/setup/create-site', lang );

		return addQueryArgs( stepperFlow, {
			...context.query,
			plan: flowName,
		} );
	}

	return null;
};
