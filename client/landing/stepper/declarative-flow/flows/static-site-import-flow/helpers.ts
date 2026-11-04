import config from '@automattic/calypso-config';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

// More lenient than CAPTURE_URL_RGX, which rejects IDN, punycode and double-hyphen hosts that links
// from landing pages can carry. new URL() alone isn't enough: it accepts hosts like `https://!!!`.
const SOURCE_URL_RGX =
	/^(https?:\/\/)?[\p{L}\p{N}_-]+(\.[\p{L}\p{N}_-]+)*\.(\p{L}{2,63}|xn--[a-z0-9-]+)(:\d{1,5})?([/?#].*)?$/iu;

export const canUseStaticSiteImport = (
	platform?: ImporterPlatform | null,
	from?: string | null
) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	!! platform &&
	platform !== 'wordpress' &&
	SOURCE_URL_RGX.test( from?.trim() ?? '' );
