import { Button } from '@automattic/components';
import { translate, useRtl } from 'i18n-calypso';
import { useState } from 'react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/field';
import {
	EmailProvider,
	FormFieldNames,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';

interface MailboxFormWrapperProps {
	domains?: string[];
	onSubmit: ( mailbox: MailboxForm< EmailProvider > ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
}

const MailboxFormWrapper = ( {
	children,
	domains = [],
	onSubmit,
	provider,
	selectedDomainName,
}: MailboxFormWrapperProps & { children?: JSX.Element } ) => {
	const isRtl = useRtl();
	const [ { mailbox }, setMailboxState ] = useState( {
		mailbox: new MailboxForm< EmailProvider >( provider, selectedDomainName ),
	} );

	const renderedFields = new Set< string >();

	const handleSubmit = () => {
		renderedFields.forEach( ( fieldName ) => mailbox.validateField( fieldName as FormFieldNames ) );
		setMailboxState( { mailbox } );
		onSubmit( mailbox );
	};

	const formFields = mailbox.formFields;
	const domainAffix = {
		[ isRtl ? 'textInputPrefix' : 'textInputSuffix' ]: `\u200e@${ formFields.domain.value }\u202c`,
	};

	const commonProps = ( field: MailboxFormFieldBase< string > ) => {
		renderedFields.add( field.fieldName );
		return {
			domains,
			field,
			requestFieldValidation: () => mailbox.validateField( field.fieldName ),
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
			<div className="form__fields">
				{ provider === EmailProvider.Titan ? <TitanFormFields /> : <GoogleFormFields /> }
			</div>

			<div className="form__children">{ children }</div>

			<Button className="form__button" primary onClick={ handleSubmit }>
				{ translate( 'Complete setup' ) }
			</Button>
		</div>
	);
};

export { MailboxFormWrapper };
export type { MailboxFormWrapperProps };
