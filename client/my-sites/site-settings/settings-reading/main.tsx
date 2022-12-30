import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { NewsletterSettingsSection } from '../reading-newsletter-settings';
import { RssFeedSettingsSection } from '../reading-rss-feed-settings';
import { SiteSettingsSection } from '../reading-site-settings';
import wrapSettingsForm from '../wrap-settings-form';

const isEnabled = config.isEnabled( 'settings/modernize-reading-settings' );

type Settings = {
	posts_per_page?: boolean;
	posts_per_rss?: boolean;
	rss_use_excerpt?: boolean;
	wpcom_featured_image_in_email?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
};

const getFormSettings = ( settings: Settings ) => {
	if ( ! settings ) {
		return {};
	}

	const {
		posts_per_page,
		posts_per_rss,
		rss_use_excerpt,
		wpcom_featured_image_in_email,
		wpcom_subscription_emails_use_excerpt,
	} = settings;

	return {
		...( posts_per_page && { posts_per_page } ),
		...( posts_per_rss && { posts_per_rss } ),
		...( rss_use_excerpt && { rss_use_excerpt } ),
		...( wpcom_featured_image_in_email && { wpcom_featured_image_in_email } ),
		...( wpcom_subscription_emails_use_excerpt && { wpcom_subscription_emails_use_excerpt } ),
	};
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteUrl = siteId && getSiteUrl( state, siteId );
	return {
		...( siteUrl && { siteUrl } ),
	};
} );

type Fields = {
	posts_per_page?: number;
	posts_per_rss?: number;
	rss_use_excerpt?: boolean;
	wpcom_featured_image_in_email?: boolean;
	wpcom_subscription_emails_use_excerpt?: boolean;
};

type ReadingSettingsFormProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	siteUrl?: string;
	updateFields: ( fields: Fields ) => void;
};

const ReadingSettingsForm = wrapSettingsForm( getFormSettings )(
	connectComponent(
		( {
			fields,
			onChangeField,
			handleSubmitForm,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			siteUrl,
			updateFields,
		}: ReadingSettingsFormProps ) => {
			const disabled = isRequestingSettings || isSavingSettings;
			return (
				<form onSubmit={ handleSubmitForm }>
					<SiteSettingsSection
						fields={ fields }
						onChangeField={ onChangeField }
						handleSubmitForm={ handleSubmitForm }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
					/>
					<RssFeedSettingsSection
						fields={ fields }
						onChangeField={ onChangeField }
						handleSubmitForm={ handleSubmitForm }
						updateFields={ updateFields }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
						siteUrl={ siteUrl }
					/>
					<NewsletterSettingsSection
						fields={ fields }
						handleToggle={ handleToggle }
						handleSubmitForm={ handleSubmitForm }
						disabled={ disabled }
						isSavingSettings={ isSavingSettings }
						updateFields={ updateFields }
					/>
				</form>
			);
		}
	)
);

const ReadingSettings = () => {
	const translate = useTranslate();

	if ( ! isEnabled ) {
		return null;
	}

	return (
		<Main className="site-settings">
			<DocumentHead title={ translate( 'Reading Settings' ) } />
			<FormattedHeader brandFont headerText={ translate( 'Reading Settings' ) } align="left" />
			<ReadingSettingsForm />
		</Main>
	);
};

export default ReadingSettings;
