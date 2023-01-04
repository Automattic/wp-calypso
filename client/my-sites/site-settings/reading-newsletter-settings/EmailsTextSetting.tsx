import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';

type EmailsTextSettingProps = {
	value?: {
		invitation: string;
		comment_follow: string;
	};
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
		<div className="site-settings__emails-test-settings-container">
			<FormFieldset>
				{ /* @ts-expect-error FormLegend is not typed and is causing errors */ }
				<FormLegend>
					These settings change the emails sent from your site to your readers
				</FormLegend>
				<FormLabel htmlFor="welcome_email_text">{ translate( 'Welcome email text' ) }</FormLabel>
				<FormTextarea
					name="welcome_email_text"
					id="welcome_email_text"
					value={ value?.invitation }
					onChange={ updateSubscriptionOptions( 'invitation' ) }
					disabled={ disabled }
					autoCapitalize="none"
				/>
				<FormSettingExplanation>
					{ translate(
						'The welcome message sent out to new readers when they subscribe to your blog.'
					) }
				</FormSettingExplanation>
				<FormLabel htmlFor="comment_follow_email_text">
					{ translate( 'Comment follow email text' ) }
				</FormLabel>
				<FormTextarea
					name="comment_follow_email_text"
					id="comment_follow_email_text"
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
