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

/**
 * Whether this run builds a preview site instead of asking for a plan first: the customer signs in,
 * their site is imported onto a free preview, and they pay to keep it. Only for a new destination.
 */
export const isStaticSiteImportPreview = ( query: URLSearchParams ) =>
	config.isEnabled( 'migration/static-site-preview' ) &&
	! query.get( 'siteId' ) &&
	! query.get( 'siteSlug' );
