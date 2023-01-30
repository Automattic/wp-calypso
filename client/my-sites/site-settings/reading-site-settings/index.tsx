import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { BlogPagesSetting, BLOG_PAGES_OPTION } from './BlogPagesSetting';
import { RelatedPostsSetting } from './RelatedPostsSetting';
import YourHomepageDisplaysSetting from './YourHomepageDisplaysSetting';

type Fields = {
	jetpack_relatedposts_enabled?: boolean;
	jetpack_relatedposts_show_context?: boolean;
	jetpack_relatedposts_show_date?: boolean;
	jetpack_relatedposts_show_headline?: boolean;
	jetpack_relatedposts_show_thumbnails?: boolean;
	page_for_posts?: string;
	page_on_front?: string;
	posts_per_page?: number;
	show_on_front?: 'posts' | 'page';
};

type SiteSettingsSectionProps = {
	fields: Fields;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	handleToggle?: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	disabled?: boolean;
	isRequestingSettings?: boolean;
	isSavingSettings?: boolean;
	updateFields: ( fields: Fields ) => void;
};

export const SiteSettingsSection = ( {
	fields,
	onChangeField,
	handleToggle,
	handleSubmitForm,
	disabled,
	isRequestingSettings,
	isSavingSettings,
	updateFields,
}: SiteSettingsSectionProps ) => {
	const translate = useTranslate();
	const { page_for_posts, page_on_front, posts_per_page, show_on_front } = fields;

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				title={ translate( 'Site settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card className="site-settings__card">
				<YourHomepageDisplaysSetting
					value={ { page_for_posts, page_on_front, show_on_front } }
					onChange={ ( value ) => {
						updateFields( value );
					} }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<BlogPagesSetting
					value={ posts_per_page }
					onChange={ onChangeField( BLOG_PAGES_OPTION ) }
					disabled={ disabled }
				/>
			</Card>
			<Card className="site-settings__card">
				<RelatedPostsSetting
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
				/>
			</Card>
		</>
	);
};
