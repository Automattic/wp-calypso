import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';

export const EARLY_PROVISION_TARGET_WPCOM_ATOMIC = 'wpcom-atomic';

export function getEarlyCreatedSiteId(
	flow: string | undefined,
	earlyCreatedSite: string | null,
	earlyProvisionTarget: string | null
): number | null {
	if (
		flow === AI_SITE_BUILDER_FLOW &&
		earlyProvisionTarget === EARLY_PROVISION_TARGET_WPCOM_ATOMIC &&
		! earlyCreatedSite
	) {
		throw new Error( 'Missing early_created_site for WPCOM Atomic early provisioning.' );
	}

	if ( flow !== AI_SITE_BUILDER_FLOW || ! earlyCreatedSite ) {
		return null;
	}

	const blogId = parseInt( earlyCreatedSite, 10 );
	if ( isNaN( blogId ) ) {
		throw new Error( 'Invalid early_created_site parameter.' );
	}

	return blogId;
}
