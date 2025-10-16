import { EmailProvider } from '@automattic/api-core';
import { IntervalLength } from '../types';

/**
 * Returns the correct product slug for the specified provider and interval using a map.
 */
export const getProductSlugForProviderAndInterval = (
	provider: EmailProvider,
	intervalLength: IntervalLength
) => {
	switch ( provider ) {
		case 'titan':
			return intervalLength === 'monthly' ? 'wp_titan_mail_monthly' : 'wp_titan_mail_yearly';

		case 'google_workspace':
			return intervalLength === 'monthly'
				? 'wp_google_workspace_business_starter_monthly'
				: 'wp_google_workspace_business_starter_yearly';

		default:
			return '';
	}
};
