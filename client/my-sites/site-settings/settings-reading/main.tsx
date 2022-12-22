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

// Settings are not typed yet, so we need to use `unknown` for now.
type Settings = unknown;

const getFormSettings = ( settings: Settings = {} ) => {
	if ( ! settings ) {
		return {};
	}

	// @ts-expect-error Settings are not typed yet, so we need to use `unknown` for now.
	const { posts_per_page, posts_per_rss, wpcom_featured_image_in_email } = settings;
	return {
		...( posts_per_page && { posts_per_page } ),
		...( posts_per_rss && { posts_per_rss } ),
		...( wpcom_featured_image_in_email && { wpcom_featured_image_in_email } ),
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
	wpcom_featured_image_in_email?: boolean;
};

type ReadingSettingsFormProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	siteUrl?: string;
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
