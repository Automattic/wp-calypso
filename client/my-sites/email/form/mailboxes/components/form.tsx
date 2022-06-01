import { useRtl } from 'i18n-calypso';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/field';
import {
	EmailProvider,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';

interface MailboxFormWrapperProps {
	provider: EmailProvider;
	selectedDomainName: string;
}

const MailboxFormWrapper = ( {
	children,
	mailbox,
	provider,
}: MailboxFormWrapperProps & {
	children?: JSX.Element | false;
	mailbox: MailboxForm< EmailProvider >;
} ): JSX.Element => {
	const isRtl = useRtl();

	const formFields = mailbox.formFields;
	const domainAffix = {
		[ isRtl ? 'textInputPrefix' : 'textInputSuffix' ]: `\u200e@${ formFields.domain.value }\u202c`,
	};

	const commonProps = ( field: MailboxFormFieldBase< string > ) => {
		return {
			field,
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
				{ provider === EmailProvider.Titan ? <TitanFormFields /> : <GoogleFormFields /> }
			</div>

			<div className="form__children">{ children }</div>
		</div>
	);
};

export default MailboxFormWrapper;
