import config from '@automattic/calypso-config';
import { isPlatformImportable } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const STATIC_SITE_IMPORT_PLATFORMS: ImporterPlatform[] = [ 'wix', 'squarespace' ];

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	!! platform &&
	// Sources with an importer keep using it for now.
	( STATIC_SITE_IMPORT_PLATFORMS.includes( platform ) || ! isPlatformImportable( platform ) ) &&
	Boolean( from );
