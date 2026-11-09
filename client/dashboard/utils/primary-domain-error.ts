import { __ } from '@wordpress/i18n';

export function getPrimaryDomainErrorMessage( error: Error ): string {
	return error.message || __( "Something went wrong and we couldn't change your primary domain." );
}
