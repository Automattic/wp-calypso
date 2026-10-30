import config from '@automattic/calypso-config';
import { isPlatformImportable } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	!! platform &&
	platform !== 'wordpress' &&
	// Sources with an importer keep using it for now.
	! isPlatformImportable( platform ) &&
	Boolean( from );
