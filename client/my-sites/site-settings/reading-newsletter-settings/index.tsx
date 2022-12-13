import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { FeaturedImageEmailSetting } from './FeaturedImageEmailSetting';

type Fields = {
	featured_image_email_enabled?: boolean;
};

type NewsletterSettingsSectionProps = {
	fields: Fields;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	handleSubmitForm: ( event: React.FormEvent< HTMLFormElement > ) => void;
	disabled?: boolean;
	isSavingSettings: boolean;
};

export const NewsletterSettingsSection = ( {
	fields,
	handleToggle,
	handleSubmitForm,
	disabled,
	isSavingSettings,
}: NewsletterSettingsSectionProps ) => {
	const translate = useTranslate();
	const { featured_image_email_enabled } = fields;

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				title={ translate( 'Newsletter settings' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>
			<Card>
				<FeaturedImageEmailSetting
					value={ featured_image_email_enabled }
					handleToggle={ handleToggle }
					disabled={ disabled }
				/>
			</Card>
		</>
	);
};
