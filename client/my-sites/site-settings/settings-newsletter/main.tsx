import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import SubscriptionsModuleBanner from 'calypso/blocks/subscriptions-module-banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite as isJetpackSiteSelector } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';
import { NewsletterCategoriesSection } from './newsletter-categories-section';
// import { NewsletterSettingsSection } from './newsletter-section';
import { EmailsTextSetting } from './newsletter-section/EmailsTextSetting';
import { ExcerptSetting } from './newsletter-section/ExcerptSetting';
import { FeaturedImageEmailSetting } from './newsletter-section/FeaturedImageEmailSetting';
import { SubscribeModalSetting } from './newsletter-section/SubscribeModalSetting';

const defaultNewsletterCategoryIds: number[] = [];

export type SubscriptionOptions = {
	invitation: string;
	comment_follow: string;
};

type Fields = {
	subscription_options?: SubscriptionOptions;
	wpcom_featured_image_in_email?: boolean;
	wpcom_newsletter_categories?: number[];
	wpcom_newsletter_categories_enabled?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
	sm_enabled?: boolean;
};

const getFormSettings = ( settings?: Fields ) => {
	if ( ! settings ) {
		return {};
	}

	const {
		subscription_options,
		wpcom_featured_image_in_email,
		wpcom_newsletter_categories,
		wpcom_newsletter_categories_enabled,
		wpcom_subscription_emails_use_excerpt,
		sm_enabled,
	} = settings;

	return {
		...( subscription_options && { subscription_options } ),
		wpcom_featured_image_in_email: !! wpcom_featured_image_in_email,
		wpcom_newsletter_categories: wpcom_newsletter_categories || [],
		wpcom_newsletter_categories_enabled: !! wpcom_newsletter_categories_enabled,
		wpcom_subscription_emails_use_excerpt: !! wpcom_subscription_emails_use_excerpt,
		sm_enabled: !! sm_enabled,
	};
};

type NewsletterSettingsFormProps = {
	fields: Fields;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: () => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	settings: { subscription_options?: SubscriptionOptions };
	updateFields: ( fields: Fields ) => void;
};

const NewsletterSettingsForm = wrapSettingsForm( getFormSettings )( ( {
	fields,
	handleSubmitForm,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	settings,
	updateFields,
}: NewsletterSettingsFormProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const {
		wpcom_featured_image_in_email,
		wpcom_subscription_emails_use_excerpt,
		subscription_options,
		sm_enabled,
	} = fields;

	const isSubscriptionModuleInactive = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}

		const isJetpackSite = isJetpackSiteSelector( state, siteId, {
			treatAtomicAsJetpackSite: false,
		} );

		return (
			Boolean( isJetpackSite ) && isJetpackModuleActive( state, siteId, 'subscriptions' ) === false
		);
	} );

	const disabled = isSubscriptionModuleInactive || isRequestingSettings || isSavingSettings;
	const savedSubscriptionOptions = settings?.subscription_options;

	// Update subscription_options form fields when savedSubscriptionOptions changes.
	// This makes sure the form fields hold the current value after saving.
	useEffect( () => {
		updateFields( { subscription_options: savedSubscriptionOptions } );

		// If the URL has a hash, scroll to it.
		scrollToAnchor( { offset: 15 } );
	}, [ savedSubscriptionOptions, updateFields ] );

	return (
		<>
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ /*
			<form onSubmit={ handleSubmitForm }>
				<NewsletterSettingsSection
					fields={ fields }
					handleToggle={ handleToggle }
					handleSubmitForm={ handleSubmitForm }
					disabled={ disabled }
					isSavingSettings={ isSavingSettings }
					savedSubscriptionOptions={ savedSubscriptionOptions }
					updateFields={ updateFields }
				/>
			</form>
			*/ }
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="subscriptions"
				title={ translate( 'Subscriptions' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card className="site-settings__card">
				<SubscribeModalSetting
					value={ sm_enabled }
					handleToggle={ handleToggle }
					disabled={ disabled }
				/>
			</Card>

			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="email-settings"
				title={ translate( 'Email' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
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

			<form onSubmit={ handleSubmitForm }>
				<NewsletterCategoriesSection
					disabled={ disabled }
					newsletterCategoryIds={
						fields.wpcom_newsletter_categories || defaultNewsletterCategoryIds
					}
					newsletterCategoriesEnabled={ fields.wpcom_newsletter_categories_enabled }
					handleToggle={ handleToggle }
					handleSubmitForm={ handleSubmitForm }
					updateFields={ updateFields }
					isSavingSettings={ isSavingSettings }
				/>
			</form>

			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="messages"
				title={ translate( 'Messages' ) }
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
		</>
	);
} );

const NewsletterSettings = () => {
	const translate = useTranslate();

	return (
		<Main>
			<DocumentHead title={ translate( 'Newsletter Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Newsletter Settings' ) } align="left" />
			<SubscriptionsModuleBanner />
			<NewsletterSettingsForm />
		</Main>
	);
};

export default NewsletterSettings;
