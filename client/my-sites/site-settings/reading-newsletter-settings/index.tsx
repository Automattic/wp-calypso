import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { SubscriptionOptions } from '../settings-reading/main';
import { EmailsTextSetting } from './EmailsTextSetting';
import { ExcerptSetting } from './ExcerptSetting';
import { FeaturedImageEmailSetting } from './FeaturedImageEmailSetting';
import { SubscribeModalSetting } from './SubscribeModalSetting';

type Fields = {
	wpcom_featured_image_in_email?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	subscription_options?: SubscriptionOptions;
	wpcom_subscribe_modal?: boolean;
};

type NewsletterSettingsSectionProps = {
	fields: Fields;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	disabled?: boolean;
	isSavingSettings: boolean;
	savedSubscriptionOptions?: SubscriptionOptions;
	updateFields: ( fields: Fields ) => void;
};

export const NewsletterSettingsSection = ( {
	fields,
	handleToggle,
	handleSubmitForm,
	disabled,
	isSavingSettings,
	savedSubscriptionOptions,
	updateFields,
}: NewsletterSettingsSectionProps ) => {
	const translate = useTranslate();
	const {
		wpcom_featured_image_in_email,
		wpcom_subscription_emails_use_excerpt,
		subscription_options,
		wpcom_subscribe_modal,
	} = fields;

	// Update subscription_options form fields when savedSubscriptionOptions changes.
	// This makes sure the form fields hold the current value after saving.
	useEffect( () => {
		updateFields( { subscription_options: savedSubscriptionOptions } );
	}, [ savedSubscriptionOptions ] );

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
				<SubscribeModalSetting
					value={ wpcom_subscribe_modal }
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
