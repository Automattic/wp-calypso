import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useNewsletterCategoriesBlogSticker } from 'calypso/data/newsletter-categories';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import { isSimpleSite as isSimpleSiteSelector } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { NewsletterCategoriesSettings } from '../newsletter-categories-settings';
import { SubscriptionOptions } from '../settings-reading/main';
import { EmailsTextSetting } from './EmailsTextSetting';
import { ExcerptSetting } from './ExcerptSetting';
import { FeaturedImageEmailSetting } from './FeaturedImageEmailSetting';
import { SubscribeModalSetting } from './SubscribeModalSetting';

type Fields = {
	wpcom_featured_image_in_email?: boolean;
	wpcom_newsletter_categories_enabled?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	subscription_options?: SubscriptionOptions;
	sm_enabled?: boolean;
};

type NewsletterSettingsSectionProps = {
	fields: Fields;
	handleAutosavingToggle: ( field: string ) => ( value: boolean ) => void;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	disabled?: boolean;
	isSavingSettings: boolean;
	savedSubscriptionOptions?: SubscriptionOptions;
	updateFields: ( fields: Fields ) => void;
};

export const NewsletterSettingsSection = ( {
	fields,
	handleAutosavingToggle,
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
		wpcom_newsletter_categories_enabled,
		wpcom_subscription_emails_use_excerpt,
		subscription_options,
		sm_enabled,
	} = fields;
	const siteId = useSelector( getSelectedSiteId );
	const isSimpleSite = useSelector( isSimpleSiteSelector );

	// Update subscription_options form fields when savedSubscriptionOptions changes.
	// This makes sure the form fields hold the current value after saving.
	useEffect( () => {
		updateFields( { subscription_options: savedSubscriptionOptions } );

		// If the URL has a hash, scroll to it.
		scrollToAnchor( { offset: 15 } );
	}, [ savedSubscriptionOptions, updateFields ] );

	const hasNewsletterCategoriesBlogSticker = useNewsletterCategoriesBlogSticker( { siteId } );

	return (
		<>
			{ config.isEnabled( 'settings/newsletter-categories' ) &&
				( isSimpleSite || hasNewsletterCategoriesBlogSticker ) && (
					<Card className="site-settings__card">
						<NewsletterCategoriesSettings
							disabled={ disabled }
							handleAutosavingToggle={ handleAutosavingToggle }
							toggleValue={ wpcom_newsletter_categories_enabled }
						/>
					</Card>
				) }
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="newsletter-settings"
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
					value={ sm_enabled }
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
