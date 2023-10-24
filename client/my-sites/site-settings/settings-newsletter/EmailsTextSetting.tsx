import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { SubscriptionOptions } from '../settings-reading/main';

type EmailsTextSettingProps = {
	value?: SubscriptionOptions;
	disabled?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

type SubscriptionOption = {
	[ key: string ]: string;
};

export const EmailsTextSetting = ( { value, disabled, updateFields }: EmailsTextSettingProps ) => {
	const translate = useTranslate();

	const updateSubscriptionOptions =
		( option: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const textAreaValue = event.target.value;
			const currentSubscriptionOptions = value;

			const newSubscriptionOption: SubscriptionOption = {};
			newSubscriptionOption[ option ] = textAreaValue;

			const mergedOptions = { ...currentSubscriptionOptions, ...newSubscriptionOption };
			const fieldToUpdate = {
				subscription_options: mergedOptions,
			};

			updateFields( fieldToUpdate );
		};

	return (
		<div className="site-settings__emails-text-settings-container">
			<FormFieldset>
				<FormLegend>
					{ translate( 'These settings change the emails sent from your site to your readers' ) }
				</FormLegend>
				<FormLabel htmlFor="confirmation_email_message">
					{ translate( 'Confirmation email message' ) }
				</FormLabel>
				<FormTextarea
					name="confirmation_email_message"
					id="confirmation_email_message"
					value={ value?.invitation }
					onChange={ updateSubscriptionOptions( 'invitation' ) }
					autoCapitalize="none"
					disabled
				/>
				<FormSettingExplanation>
					{ translate(
						'The ability to customize the confirmation email message had to be disabled to prevent abuse. It will revert to the default message for all new subscribers.'
					) }
				</FormSettingExplanation>
				<FormLabel htmlFor="comment_follow_email_message">
					{ translate( 'Comment follow email message' ) }
				</FormLabel>
				<FormTextarea
					name="comment_follow_email_message"
					id="comment_follow_email_message"
					value={ value?.comment_follow }
					onChange={ updateSubscriptionOptions( 'comment_follow' ) }
					disabled={ disabled }
					autoCapitalize="none"
				/>
				<FormSettingExplanation>
					{ translate( 'The email sent out when someone follows one of your posts.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		</div>
	);
};
