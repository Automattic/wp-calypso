import { __ } from '@wordpress/i18n';

export function getPrimaryDomainErrorMessage( error: Error ): string {
	return error.message || __( 'Failed to change primary domain.' );
}
