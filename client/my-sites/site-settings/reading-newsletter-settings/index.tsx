import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { EmailsTextSetting } from './EmailsTextSetting';
import { ExcerptSetting } from './ExcerptSetting';
import { FeaturedImageEmailSetting } from './FeaturedImageEmailSetting';

type Fields = {
	wpcom_featured_image_in_email?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	subscription_options?: {
		invitation: string;
		comment_follow: string;
	};
};

type NewsletterSettingsSectionProps = {
	fields: Fields;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	disabled?: boolean;
	isSavingSettings: boolean;
	subscriptionOptions?: { invitation: string; comment_follow: string };
	updateFields: ( fields: Fields ) => void;
};

export const NewsletterSettingsSection = ( {
	fields,
	handleToggle,
	handleSubmitForm,
	disabled,
	isSavingSettings,
	subscriptionOptions,
	updateFields,
}: NewsletterSettingsSectionProps ) => {
	const translate = useTranslate();
	const {
		wpcom_featured_image_in_email,
		wpcom_subscription_emails_use_excerpt,
		subscription_options,
	} = fields;

	/* eslint-disable no-console */
	console.log( 'subscription_options', subscription_options ); // value in the form field
	console.log( 'subscriptionOptions', subscriptionOptions ); // current value

	// useEffect to update subscription_options when subscriptionOptions changes
	useEffect( () => {
		updateFields( { subscription_options: subscriptionOptions } );
	}, [ subscriptionOptions ] );

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				title={ translate( 'Newsletter settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card className="site-settings__card">
				<EmailsTextSetting
					value={ subscription_options }
					updateFields={ updateFields }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<FeaturedImageEmailSetting
					value={ wpcom_featured_image_in_email }
					handleToggle={ handleToggle }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<ExcerptSetting
					value={ wpcom_subscription_emails_use_excerpt }
					updateFields={ updateFields }
					disabled={ disabled }
				/>
			</Card>
		</>
	);
};
