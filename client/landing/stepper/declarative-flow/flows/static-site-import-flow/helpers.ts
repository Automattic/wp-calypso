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
