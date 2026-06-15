import { addQueryArgs } from '@wordpress/url';
import { withLocale } from './with-locale';

export const getOnboardingPostCheckoutDestination = ( {
	flowName,
	locale,
	siteSlug,
}: {
	flowName: string;
	locale: string;
	siteSlug: string;
} ): [
	postCheckoutDestination: string,
	checkoutBackUrl: string,
	checkoutBackUrlDomains: string,
] => {
	return [
		addQueryArgs( `/home/${ siteSlug }`, { ref: flowName } ),
		addQueryArgs( withLocale( `/setup/${ flowName }/plans`, locale ), {
			siteSlug,
		} ),
		addQueryArgs( withLocale( `/setup/${ flowName }/domains`, locale ), {
			siteSlug,
		} ),
	];
};
