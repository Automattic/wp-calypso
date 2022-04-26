import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import React from 'react';
import { validatePasswordField } from 'calypso/lib/gsuite/new-users';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes/index';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import type { MailboxFormFieldBase } from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void;
}

class RequiredValidator< T > implements Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const requiredFieldError = i18n.translate( 'This field is required.' );

		if ( ! field.value ) {
			field.error = requiredFieldError;
		}

		if ( typeof field.value === 'string' && field.value.trim() === '' ) {
			field.error = requiredFieldError;
		}
	}
}

class MailboxNameValidator< T extends EmailProvider > implements Validator< string > {
	form: MailboxForm< T >;

	constructor( form: MailboxForm< T > ) {
		this.form = form;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		if ( ! /^[\da-z_-](\.?[\da-z_-])*$/i.test( field.value ) ) {
			field.error = i18n.translate(
				'Only numbers, letters, dashes, underscores, and periods are allowed.'
			);
			return;
		}

		const domain = this.form?.formFields?.domain ?? null;

		if (
			domain &&
			! domain.error &&
			domain.value &&
			! emailValidator.validate( `${ field.value }@${ domain.value }` )
		) {
			field.error = i18n.translate( 'Please supply a valid email address.' );
			return;
		}
	}
}

class AlternateEmailValidator< T extends EmailProvider > implements Validator< string > {
	form: MailboxForm< T >;

	constructor( form: MailboxForm< T > ) {
		this.form = form;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error || ! field.value || field.value.trim() === '' ) {
			return;
		}

		const value = `${ field.value }`;

		if ( ! emailValidator.validate( value ) ) {
			field.error = i18n.translate( 'Please supply a valid email address.' );

			return;
		}

		const parts = `${ value }`.split( '@' );
		const domain = this.form?.formFields?.domain?.value ?? null;

		if ( domain && parts.length > 1 && parts[ 1 ].toLowerCase() === domain?.toLowerCase() ) {
			field.error = i18n.translate(
				'This email address must have a different domain than {{strong}}%(domain)s{{/strong}}. Please use a different email address.',
				{
					args: {
						domain: domain,
					},
					components: {
						strong: React.createElement( 'strong' ),
					},
				}
			);
		}
	}
}

class PasswordValidator implements Validator< string > {
	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const { error } = validatePasswordField( { value: field.value, error: field.error }, 10 );
		field.error = error;
	}
}

class ExistingMailboxesValidator< T extends EmailProvider > implements Validator< string > {
	form: MailboxForm< T >;

	constructor( form: MailboxForm< T > ) {
		this.form = form;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		const existingMailboxes = this.form.existingMailboxes ?? [];
		if ( ! field || field.error || ! existingMailboxes ) {
			return;
		}

		if (
			existingMailboxes
				.map( ( item ) => item.toLowerCase() )
				.includes( field.value?.toLowerCase() ?? '' )
		) {
			field.error = i18n.translate( 'Please use unique mailboxes' );
		}
	}
}

export type { Validator };

export {
	AlternateEmailValidator,
	ExistingMailboxesValidator,
	MailboxNameValidator,
	PasswordValidator,
	RequiredValidator,
};
