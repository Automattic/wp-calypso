import config from '@automattic/calypso-config';
import { isWordPressComPage } from 'calypso/blocks/import/capture/url-validation-message-helper';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	!! platform &&
	platform !== 'wordpress' &&
	!! from &&
	! isWordPressComPage( from );

/**
 * Whether this run is a customer coming back from checkout without paying, for a new destination.
 * They get their site imported onto a free preview site, and pay to keep it.
 */
export const isCheckoutExitPreview = ( query: URLSearchParams ) =>
	query.get( 'checkoutExit' ) === '1' && ! query.get( 'siteId' ) && ! query.get( 'siteSlug' );
