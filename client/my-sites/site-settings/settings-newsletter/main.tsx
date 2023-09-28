import { useTranslate } from 'i18n-calypso';
import SubscriptionsModuleBanner from 'calypso/blocks/subscriptions-module-banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { useNewsletterCategoriesBlogSticker } from 'calypso/data/newsletter-categories';
import { useSelector } from 'calypso/state';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isAtomicSiteSelector from 'calypso/state/selectors/is-site-automated-transfer';
import {
	isJetpackSite as isJetpackSiteSelector,
	isSimpleSite as isSimpleSiteSelector,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';
import { NewsletterCategoriesSection } from './newsletter-categories-section';
import { NewsletterSettingsSection } from './newsletter-section';

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
	const siteId = useSelector( getSelectedSiteId );
	const isSimpleSite = useSelector( isSimpleSiteSelector );
	const isAtomicSite = useSelector( isAtomicSiteSelector );
	const hasNewsletterCategoriesBlogSticker = useNewsletterCategoriesBlogSticker( { siteId } );

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

	return (
		<>
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ ( isSimpleSite || isAtomicSite || hasNewsletterCategoriesBlogSticker ) && (
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
			) }
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
