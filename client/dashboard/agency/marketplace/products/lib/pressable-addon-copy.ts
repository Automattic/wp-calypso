import { formatNumber } from '@automattic/number-formatters';
import { __, _n, sprintf } from '@wordpress/i18n';
import type { AgencyProduct } from '@automattic/api-core';

type PressableAddonType = 'sites' | 'storage' | 'visits' | 'phpMemory' | 'unknown';

interface PressableAddonCopy {
	callout: string;
	limit: string;
}

function getPressableAddonType( slug: string ): PressableAddonType {
	if ( slug.startsWith( 'pressable-addon-sites-' ) ) {
		return 'sites';
	}
	if ( slug.startsWith( 'pressable-addon-storage-' ) ) {
		return 'storage';
	}
	if ( slug.startsWith( 'pressable-addon-visits-' ) ) {
		return 'visits';
	}
	if ( slug.startsWith( 'pressable-addon-php-memory-' ) ) {
		return 'phpMemory';
	}
	return 'unknown';
}

const getGenericCopy = (): PressableAddonCopy => ( {
	callout: __( 'This add-on increases your Signature plan limits while your plan is active.' ),
	limit: __( "Add-ons raise your plan's limits while your plan is active." ),
} );

/** How much the add-on raises the plan limits, from the limits the products API sends. */
export function getPressableAddonCopy( product: AgencyProduct ): PressableAddonCopy {
	const metadata = product.metadata;
	if ( ! metadata ) {
		return getGenericCopy();
	}

	const installs = formatNumber( metadata.sites );
	/* translators: %s is a storage size in gigabytes. */
	const storage = sprintf( __( '%s GB' ), formatNumber( metadata.storage ) );
	const visits = formatNumber( metadata.visits );

	switch ( getPressableAddonType( product.slug ) ) {
		case 'sites':
			return {
				callout: sprintf(
					/* translators: %(installs)s is a number of sites, %(storage)s a storage size such as "10 GB", %(visits)s a number of visits. */
					__(
						'Site limit will be increased by %(installs)s, storage by %(storage)s, and visits by %(visits)s on your Signature plan.'
					),
					{ installs, storage, visits }
				),
				limit: sprintf(
					/* translators: %(installs)s is a number of sites, %(storage)s a storage size such as "10 GB", %(visits)s a number of visits. */
					_n(
						'This add-on increases your Signature plan by %(installs)s site, %(storage)s of storage, and %(visits)s monthly visits while your plan is active.',
						'This add-on increases your Signature plan by %(installs)s sites, %(storage)s of storage, and %(visits)s monthly visits while your plan is active.',
						metadata.sites
					),
					{ installs, storage, visits }
				),
			};
		case 'storage':
			return {
				callout: sprintf(
					/* translators: %(storage)s is a storage size such as "10 GB". */
					__( 'Storage limit will be increased by %(storage)s on your Signature plan.' ),
					{ storage }
				),
				limit: sprintf(
					/* translators: %(storage)s is a storage size such as "10 GB". */
					__(
						'This add-on increases your Signature plan by %(storage)s of storage while your plan is active.'
					),
					{ storage }
				),
			};
		case 'visits':
			return {
				callout: sprintf(
					/* translators: %(visits)s is a number of visits. */
					__(
						'Visits limit will be increased by %(visits)s monthly visits on your Signature plan.'
					),
					{ visits }
				),
				limit: sprintf(
					/* translators: %(visits)s is a number of visits. */
					__(
						'This add-on increases your Signature plan by %(visits)s monthly visits while your plan is active.'
					),
					{ visits }
				),
			};
		case 'phpMemory': {
			const phpMemory = metadata.php_memory;
			if ( ! phpMemory ) {
				return getGenericCopy();
			}
			return {
				callout: sprintf(
					/* translators: %(phpMemory)s is a memory size such as "512MB". */
					__(
						'PHP memory will be increased by %(phpMemory)s for each PHP worker/process on one Pressable site/domain.'
					),
					{ phpMemory }
				),
				limit: sprintf(
					/* translators: %(phpMemory)s is a memory size such as "512MB". */
					__(
						'This add-on increases PHP memory by %(phpMemory)s for each PHP worker/process on one Pressable site/domain while your Signature plan is active.'
					),
					{ phpMemory }
				),
			};
		}
		default:
			return getGenericCopy();
	}
}
