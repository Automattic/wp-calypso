import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { FeaturedImageEmailSetting } from './FeaturedImageEmailSetting';

type Fields = {
	wpcom_featured_image_in_email?: boolean;
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
	const { wpcom_featured_image_in_email } = fields;

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
					value={ wpcom_featured_image_in_email }
					handleToggle={ handleToggle }
					disabled={ disabled }
				/>
			</Card>
		</>
	);
};
