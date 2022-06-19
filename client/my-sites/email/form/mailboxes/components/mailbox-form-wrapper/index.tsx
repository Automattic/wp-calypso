import { useRtl } from 'i18n-calypso';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-field';
import {
	EmailProvider,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';

interface MailboxFormWrapperProps {
	mailbox: MailboxForm< EmailProvider >;
	onFieldValueChanged?: ( field: MailboxFormFieldBase< string > ) => void;
}

const MailboxFormWrapper = ( {
	children,
	mailbox,
	onFieldValueChanged = () => undefined,
}: MailboxFormWrapperProps & {
	children?: JSX.Element | false;
} ): JSX.Element => {
	const isRtl = useRtl();

	const formFields = mailbox.formFields;
	const domainAffix = {
		[ isRtl ? 'textInputPrefix' : 'textInputSuffix' ]: `\u200e@${ formFields.domain.value }\u202c`,
	};

	let renderPosition = 0;

	const commonFieldProps = ( field: MailboxFormFieldBase< string > ) => {
		++renderPosition;

		return {
			field,
			onFieldValueChanged,
			onRequestFieldValidation: () => mailbox.validateField( field.fieldName ),
			renderPosition,
		};
	};

	const renderUserFormFields = () => {
		return (
			<>
				<MailboxField
					lowerCaseChangeValue
					{ ...commonFieldProps( formFields.mailbox ) }
					{ ...domainAffix }
				/>

				<MailboxField isPasswordField { ...commonFieldProps( formFields.password ) } />
			</>
		);
	};

	const GoogleFormFields = () => {
		const googleFormFields = formFields as GoogleMailboxFormFields;

		return (
			<>
				{ googleFormFields.firstName && (
					<MailboxField { ...commonFieldProps( googleFormFields.firstName ) } />
				) }

				{ googleFormFields.lastName && (
					<MailboxField { ...commonFieldProps( googleFormFields.lastName ) } />
				) }

				{ renderUserFormFields() }
			</>
		);
	};

	const TitanFormFields = () => {
		const titanFormFields = formFields as TitanMailboxFormFields;

		return (
			<>
				{ titanFormFields.name && <MailboxField { ...commonFieldProps( titanFormFields.name ) } /> }

				{ renderUserFormFields() }

				{ titanFormFields.alternativeEmail && (
					<MailboxField { ...commonFieldProps( titanFormFields.alternativeEmail ) } />
				) }
			</>
		);
	};

	return (
		<div>
			<div className="mailbox-form-wrapper__fields mailbox-form-wrapper__new-mailbox">
				{ mailbox.provider === EmailProvider.Titan ? <TitanFormFields /> : <GoogleFormFields /> }
			</div>

			<div className="mailbox-form-wrapper__children">{ children }</div>
		</div>
	);
};

export { MailboxFormWrapper };
export type { MailboxFormWrapperProps };
