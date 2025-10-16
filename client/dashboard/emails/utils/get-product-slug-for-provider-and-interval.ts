import { EmailProvider } from '@automattic/api-core';
import { TITAN_MAIL_YEARLY_SLUG, TITAN_MAIL_MONTHLY_SLUG } from '../constants';
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
			return intervalLength === 'monthly' ? TITAN_MAIL_MONTHLY_SLUG : TITAN_MAIL_YEARLY_SLUG;

		case 'google_workspace':
			return intervalLength === 'monthly'
				? 'wp_google_workspace_business_starter_monthly'
				: 'wp_google_workspace_business_starter_yearly';

		default:
			return '';
	}
};
