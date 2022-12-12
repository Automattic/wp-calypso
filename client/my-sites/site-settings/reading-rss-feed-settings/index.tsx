import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { SyndicationFeedsSetting, SYNDICATION_FEEDS_OPTION } from './SyndicationFeedsSetting';

type Fields = {
	posts_per_rss?: number;
};

type RssFeedSettingsSectionProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	disabled?: boolean;
	siteUrl?: string;
	isSavingSettings?: boolean;
};

export const RssFeedSettingsSection = ( {
	fields,
	onChangeField,
	handleSubmitForm,
	disabled,
	siteUrl,
	isSavingSettings,
}: RssFeedSettingsSectionProps ) => {
	const translate = useTranslate();
	const { posts_per_rss } = fields;

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				title={ translate( 'RSS feed settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card>
				<SyndicationFeedsSetting
					value={ posts_per_rss }
					onChange={ onChangeField( SYNDICATION_FEEDS_OPTION ) }
					disabled={ disabled }
					siteUrl={ siteUrl }
				/>
			</Card>
		</>
	);
};
