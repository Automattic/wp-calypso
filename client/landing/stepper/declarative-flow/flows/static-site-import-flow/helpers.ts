import config from '@automattic/calypso-config';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	Boolean( platform ) &&
	platform !== 'wordpress' &&
	Boolean( from );
