import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { ExcerptSetting } from './ExcerptSetting';
import { SyndicationFeedsSetting, SYNDICATION_FEEDS_OPTION } from './SyndicationFeedsSetting';

type Fields = {
	posts_per_rss?: number;
	rss_use_excerpt?: boolean;
};

type RssFeedSettingsSectionProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	updateFields: ( fields: Fields ) => void;
	disabled?: boolean;
	siteUrl?: string;
	isSavingSettings?: boolean;
};

export const RssFeedSettingsSection = ( {
	fields,
	onChangeField,
	handleSubmitForm,
	updateFields,
	disabled,
	siteUrl,
	isSavingSettings,
}: RssFeedSettingsSectionProps ) => {
	const translate = useTranslate();
	const { posts_per_rss, rss_use_excerpt } = fields;

	return (
		<>
			<SettingsSectionHeader
				title={ translate( 'RSS feed settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card className="site-settings__card">
				<SyndicationFeedsSetting
					value={ posts_per_rss }
					onChange={ onChangeField( SYNDICATION_FEEDS_OPTION ) }
					disabled={ disabled }
					siteUrl={ siteUrl }
				/>
			</Card>
			<Card className="site-settings__card">
				<ExcerptSetting
					value={ rss_use_excerpt }
					updateFields={ updateFields }
					disabled={ disabled }
				/>
			</Card>
		</>
	);
};
