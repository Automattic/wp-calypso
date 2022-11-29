import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

export const SiteSettingsSection = () => {
	const translate = useTranslate();

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader title={ translate( 'Site settings' ) } showButton={ true } />
			<Card>{ /* Site settings will go here */ }</Card>
		</>
	);
};
