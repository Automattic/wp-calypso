import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { SiteSettingsSection } from '../reading-site-settings';
import wrapSettingsForm from '../wrap-settings-form';
import { NewsletterSettingsSection } from './newsletter-settings-section';
import { RssFeedSettingsSection } from './rss-feed-settings-section';

const isEnabled = config.isEnabled( 'settings/modernize-reading-settings' );

// Settings are not typed yet, so we need to use `unknown` for now.
type Settings = unknown;

const getFormSettings = ( settings: Settings = {} ) => {
	if ( ! settings ) {
		return {};
	}

	// @ts-expect-error Settings are not typed yet, so we need to use `unknown` for now.
	const { posts_per_page } = settings;
	return {
		...( posts_per_page && { posts_per_page } ),
	};
};

type Fields = {
	posts_per_page?: number;
};

type ReadingSettingsFormProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
};

const ReadingSettingsForm = wrapSettingsForm( getFormSettings )(
	( {
		fields,
		onChangeField,
		handleSubmitForm,
		isRequestingSettings,
		isSavingSettings,
	}: ReadingSettingsFormProps ) => {
		return (
			<form onSubmit={ handleSubmitForm }>
				<SiteSettingsSection
					fields={ fields }
					onChangeField={ onChangeField }
					handleSubmitForm={ handleSubmitForm }
					disabled={ isRequestingSettings || isSavingSettings }
				/>
				<RssFeedSettingsSection />
				<NewsletterSettingsSection />
			</form>
		);
	}
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
