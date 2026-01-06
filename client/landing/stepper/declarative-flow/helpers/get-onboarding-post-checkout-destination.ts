import { addQueryArgs } from '@wordpress/url';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { withLocale } from './with-locale';

export const getOnboardingPostCheckoutDestination = ( {
	shouldRedirectToMultiSiteDashboard,
	flowName,
	locale,
	siteSlug,
}: {
	shouldRedirectToMultiSiteDashboard: boolean;
	flowName: string;
	locale: string;
	siteSlug: string;
} ): [ postCheckoutDestination: string, checkoutBackUrl: string ] => {
	if ( shouldRedirectToMultiSiteDashboard ) {
		return [
			addQueryArgs( dashboardLink( `/sites/${ siteSlug }` ), {
				ref: flowName,
			} ),
			addQueryArgs( withLocale( `/setup/${ flowName }/plans`, locale ), {
				siteSlug,
			} ),
		];
	}

	return [
		addQueryArgs( `/home/${ siteSlug }`, { ref: flowName } ),
		addQueryArgs( withLocale( `/setup/${ flowName }/plans`, locale ), {
			siteSlug,
		} ),
	];
};
