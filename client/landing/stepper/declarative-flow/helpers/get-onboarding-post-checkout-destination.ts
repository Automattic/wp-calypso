import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { withLocale } from './with-locale';

export const getOnboardingPostCheckoutDestination = ( {
	flowName,
	locale,
	siteSlug,
}: {
	flowName: string;
	locale: string;
	siteSlug: string;
} ): [ postCheckoutDestination: string, checkoutBackUrl: string ] => {
	/**
	 * If the dashboard/v2/onboarding feature flag is enabled, we'll redirect the user to the new Multi-site Dashboard.
	 * We aren't using the dashboard/v2 FF because it's enabled by default on wpcalypso.json which would break e2e tests.
	 * Since we're aiming to remove steps after the isMvpOnboarding experiment ends,
	 * we'll redirect the user to the new Dashboard here.
	 */
	if ( isEnabled( 'dashboard/v2/onboarding' ) ) {
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
