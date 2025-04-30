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

	if ( flowName === 'launch-site' ) {
		const stepperFlow = withLocale( '/setup/launch-site', lang );

		return addQueryArgs( stepperFlow, context.query );
	}

	return null;
};
