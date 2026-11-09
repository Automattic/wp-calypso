import { __ } from '@wordpress/i18n';

const ATOMIC_DOMAIN_IN_USE_PATTERN = /Domain.*already used|TXT record verification is required/i;

export function getPrimaryDomainErrorMessage( message: string ): string {
	if ( ATOMIC_DOMAIN_IN_USE_PATTERN.test( message ) ) {
		return __(
			'This domain is already in use on another WordPress.com or WP Cloud site. Remove it from the originating site, or contact support to set up TXT record verification.'
		);
	}

	return message || __( "Something went wrong and we couldn't change your primary domain." );
}
