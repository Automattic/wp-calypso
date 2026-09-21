import { __ } from '@wordpress/i18n';
import { Text } from '../../../components/text';
import { DEFAULT_PROVIDER_NAME, getSiteProviderName } from '../../../utils/site-provider';
import { formatWordPressVersion } from '../../../utils/wp-version';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

// Not taken from the shared sites list, which gates PHP version on the SFTP
// plan feature and defaults an unknown host to WordPress.com. Neither holds for
// a self-hosted Jetpack site.

function Unavailable() {
	return <Text variant="muted">-</Text>;
}

export function getWpVersionField(): Field< AgencySite > {
	return {
		id: 'wp_version',
		label: __( 'WP version' ),
		enableSorting: false,
		getValue: ( { item } ) => formatWordPressVersion( item.wordpress_version ?? '' ),
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}

export function getPhpVersionField(): Field< AgencySite > {
	return {
		id: 'php_version',
		label: __( 'PHP version' ),
		enableSorting: false,
		getValue: ( { item } ) => item.php_version ?? '',
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}

export function getHostField(): Field< AgencySite > {
	return {
		id: 'host',
		label: __( 'Host' ),
		enableSorting: false,
		getValue: ( { item } ) =>
			getSiteProviderName( { hosting_provider_guess: item.hosting_provider_guess } ) ??
			( item.is_atomic || item.is_simple ? DEFAULT_PROVIDER_NAME : '' ),
		render: ( { field, item } ) => field.getValue( { item } ) || <Unavailable />,
	};
}
