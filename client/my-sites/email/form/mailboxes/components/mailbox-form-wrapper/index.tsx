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

	const commonProps = ( field: MailboxFormFieldBase< string > ) => {
		return {
			field,
			onFieldValueChanged,
			onRequestFieldValidation: () => mailbox.validateField( field.fieldName ),
		};
	};

	const UserFormFields = () => {
		return (
			<>
				<MailboxField
					lowerCaseChangeValue
					{ ...commonProps( formFields.mailbox ) }
					{ ...domainAffix }
				/>

				<MailboxField isPasswordField { ...commonProps( formFields.password ) } />
			</>
		);
	};

	const GoogleFormFields = () => {
		const googleFormFields = formFields as GoogleMailboxFormFields;

		return (
			<>
				{ googleFormFields.firstName && (
					<MailboxField { ...commonProps( googleFormFields.firstName ) } />
				) }

				{ googleFormFields.lastName && (
					<MailboxField { ...commonProps( googleFormFields.lastName ) } />
				) }

				<UserFormFields />
			</>
		);
	};

	const TitanFormFields = () => {
		const titanFormFields = formFields as TitanMailboxFormFields;

		return (
			<>
				{ titanFormFields.name && <MailboxField { ...commonProps( titanFormFields.name ) } /> }

				<UserFormFields />

				{ titanFormFields.alternativeEmail && (
					<MailboxField { ...commonProps( titanFormFields.alternativeEmail ) } />
				) }
			</>
		);
	};

	return (
		<div>
			<div className="form__fields form__new-mailbox">
				{ mailbox.provider === EmailProvider.Titan ? <TitanFormFields /> : <GoogleFormFields /> }
			</div>

			<div className="form__children">{ children }</div>
		</div>
	);
};

export { MailboxFormWrapper };
export type { MailboxFormWrapperProps };
