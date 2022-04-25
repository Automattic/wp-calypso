import {
	FIELD_MAILBOX,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	MailboxFormFieldsFactory,
} from 'calypso/my-sites/email/form/mailboxes/types';
import { RequiredValidator } from 'calypso/my-sites/email/form/mailboxes/validators';
import type {
	ValidatorFieldNames,
	MailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { Validator } from 'calypso/my-sites/email/form/mailboxes/validators';

class MailboxForm< T extends EmailProvider > {
	formFields: MailboxFormFields;
	provider: T;
	validators: [ ValidatorFieldNames, Validator< unknown > ][] = [
		[ FIELD_MAILBOX, new RequiredValidator< string >() ],
		[ FIELD_PASSWORD, new RequiredValidator< string >() ],
		[ FIELD_UUID, new RequiredValidator< string >() ],
	];

	constructor( provider: T ) {
		this.provider = provider;
		this.formFields = MailboxFormFieldsFactory.create( provider );
	}

	validate() {
		for ( const [ fieldName, validator ] of this.validators ) {
			const field = Reflect.get( this.formFields, fieldName ?? '' );
			if ( ! field ) {
				return;
			}

			validator.validate( field );
		}
	}
}

export { MailboxForm };
