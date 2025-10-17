import { EmailProvider, GoogleWorkspaceSlugs, TitanMailSlugs } from '@automattic/api-core';
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
			return intervalLength === 'monthly'
				? TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG
				: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG;

		case 'google_workspace':
			return intervalLength === 'monthly'
				? GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
				: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;

		default:
			return '';
	}
};
