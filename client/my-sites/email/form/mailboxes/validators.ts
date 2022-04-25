import i18n from 'i18n-calypso';
import type { MailboxFormFieldBase } from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void;
}

class RequiredValidator< T > implements Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void {
		if ( ! field ) {
			return;
		}

		const requiredFieldError = i18n.translate( 'This field is required' );

		if ( ! field.value ) {
			field.error = requiredFieldError;
		}

		if ( typeof field.value === 'string' && field.value.trim() === '' ) {
			field.error = requiredFieldError;
		}
	}
}

export type { Validator };

export { RequiredValidator };
