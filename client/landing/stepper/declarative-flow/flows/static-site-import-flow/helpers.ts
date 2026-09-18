import config from '@automattic/calypso-config';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

/**
 * Whether a source goes through the static-site import flow instead of the
 * content-only importer. Both flows consult this so they cannot disagree.
 */
export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	Boolean( platform ) &&
	platform !== 'wordpress' &&
	Boolean( from );
