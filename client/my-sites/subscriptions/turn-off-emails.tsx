import { useTranslate } from 'i18n-calypso';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import './style.scss';

const TurnOffEmails = ( { areEmailsBlocked } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset className="turn-off-emails">
			<span className="title">Turn off emails</span>
			<FormLabel>
				<FormInputCheckbox name="turn_off_emails" checked={ areEmailsBlocked } />
				<span>
					{ translate( 'Block all email updates from sites you’re following on WordPress.com' ) }
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default TurnOffEmails;
