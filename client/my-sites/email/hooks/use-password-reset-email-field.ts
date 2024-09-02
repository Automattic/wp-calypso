import { useSelector } from 'react-redux';
import { HiddenFieldNames } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list/index';
import { FIELD_PASSWORD_RESET_EMAIL } from 'calypso/my-sites/email/form/mailboxes/constants';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

type PasswordResetEmailFieldProps = {
	selectedDomainName: string;
	defaultHiddenFields?: HiddenFieldNames[];
};

type PasswordResetEmailFieldOptions = {
	hiddenFields: HiddenFieldNames[];
	passwordResetEmailFieldInitialValue: string;
};

export function usePasswordResetEmailField( {
	selectedDomainName,
	defaultHiddenFields = [],
}: PasswordResetEmailFieldProps ): PasswordResetEmailFieldOptions {
	const userEmail = useSelector( getCurrentUserEmail );

	// Check if the email is valid prior to official validation so we can
	// show the field without triggering a validation error when the page
	// first loads.
	const isPasswordResetEmailValid = ! new RegExp( `@${ selectedDomainName }$` ).test( userEmail );

	return {
		hiddenFields: isPasswordResetEmailValid
			? [ ...defaultHiddenFields, FIELD_PASSWORD_RESET_EMAIL ]
			: defaultHiddenFields,
		passwordResetEmailFieldInitialValue: isPasswordResetEmailValid ? userEmail : '',
	};
}
