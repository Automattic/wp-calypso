import { FormLabel } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
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
	const locale = useLocale();
	const { hasTranslation } = useI18n();

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
				{ /* @ts-expect-error FormLegend is not typed and is causing errors */ }
				<FormLegend>
					{ translate( 'These settings change the emails sent from your site to your readers' ) }
				</FormLegend>
				<FormLabel htmlFor="confirmation_email_message">
					{ hasTranslation( 'Confirmation email message' ) || locale.startsWith( 'en' )
						? translate( 'Confirmation email message' )
						: translate( 'Welcome email text' ) }
				</FormLabel>
				<FormTextarea
					name="confirmation_email_message"
					id="confirmation_email_message"
					value={ value?.invitation }
					onChange={ updateSubscriptionOptions( 'invitation' ) }
					disabled={ disabled }
					autoCapitalize="none"
				/>
				<FormSettingExplanation>
					{ hasTranslation(
						'The confirmation message sent out to new readers when they subscribe to your blog.'
					) || locale.startsWith( 'en' )
						? translate(
								'The confirmation message sent out to new readers when they subscribe to your blog.'
						  )
						: translate(
								'The welcome message sent out to new readers when they subscribe to your blog.'
						  ) }
				</FormSettingExplanation>
				<FormLabel htmlFor="comment_follow_email_message">
					{ hasTranslation( 'Comment follow email message' ) || locale.startsWith( 'en' )
						? translate( 'Comment follow email message' )
						: translate( 'Comment follow email text' ) }
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
