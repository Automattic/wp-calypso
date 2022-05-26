import { Button } from '@automattic/components';
import { useRtl } from 'i18n-calypso';
import { useState } from 'react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/field';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export const MailForm = () => {
	const isRtl = useRtl();
	const domainName = 'example.com';
	const [ { mailbox }, setMailboxState ] = useState( {
		mailbox: new MailboxForm< EmailProvider >( EmailProvider.Titan, domainName ),
	} );

	const handleSubmit = () => {
		mailbox.validate();
		setMailboxState( { mailbox } );
	};

	const formFields = mailbox.formFields;
	const domainAffix = {
		[ isRtl ? 'textInputPrefix' : 'textInputSuffix' ]: `\u200e@${ formFields.domain.value }\u202c`,
	};

	return (
		<div>
			<MailboxField
				field={ formFields.mailbox }
				lowerCaseChangeValue
				requestFieldValidation={ () => mailbox.validateField( formFields.mailbox.fieldName ) }
				{ ...domainAffix }
			/>

			<MailboxField
				field={ formFields.password }
				isPasswordField
				requestFieldValidation={ () => mailbox.validateField( formFields.password.fieldName ) }
			/>

			<Button className="index__button" primary onClick={ handleSubmit }>
				{ 'Complete setup' }
			</Button>
		</div>
	);
};

export default MailForm;
