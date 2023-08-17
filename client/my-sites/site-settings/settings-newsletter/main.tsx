import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { NewsletterSettingsSection } from '../reading-newsletter-settings';
import wrapSettingsForm from '../wrap-settings-form';

export type SubscriptionOptions = {
	invitation: string;
	comment_follow: string;
};

type Fields = {
	subscription_options?: SubscriptionOptions;
	wpcom_featured_image_in_email?: boolean;
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
		wpcom_newsletter_categories_enabled,
		wpcom_subscription_emails_use_excerpt,
		sm_enabled,
	} = settings;

	return {
		...( subscription_options && { subscription_options } ),
		wpcom_featured_image_in_email: !! wpcom_featured_image_in_email,
		wpcom_newsletter_categories_enabled: !! wpcom_newsletter_categories_enabled,
		wpcom_subscription_emails_use_excerpt: !! wpcom_subscription_emails_use_excerpt,
		sm_enabled: !! sm_enabled,
	};
};

type NewsletterSettingsFormProps = {
	fields: Fields;
	handleAutosavingToggle: ( field: string ) => ( value: boolean ) => void;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	settings: { subscription_options?: SubscriptionOptions };
	updateFields: ( fields: Fields ) => void;
};

const NewsletterSettingsForm = wrapSettingsForm( getFormSettings )(
	( {
		fields,
		handleAutosavingToggle,
		handleSubmitForm,
		handleToggle,
		isRequestingSettings,
		isSavingSettings,
		settings,
		updateFields,
	}: NewsletterSettingsFormProps ) => {
		const disabled = isRequestingSettings || isSavingSettings;
		const savedSubscriptionOptions = settings?.subscription_options;
		return (
			<form onSubmit={ handleSubmitForm }>
				<NewsletterSettingsSection
					fields={ fields }
					handleAutosavingToggle={ handleAutosavingToggle }
					handleToggle={ handleToggle }
					handleSubmitForm={ handleSubmitForm }
					disabled={ disabled }
					isSavingSettings={ isSavingSettings }
					savedSubscriptionOptions={ savedSubscriptionOptions }
					updateFields={ updateFields }
				/>
			</form>
		);
	}
);

const NewsletterSettings = () => {
	const translate = useTranslate();

	return (
		<Main>
			<DocumentHead title={ translate( 'Newsletter Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Newsletter Settings' ) } align="left" />
			<NewsletterSettingsForm />
		</Main>
	);
};

export default NewsletterSettings;
