import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

export const RssFeedSettingsSection = () => {
	const translate = useTranslate();

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader title={ translate( 'RSS feed settings' ) } showButton={ true } />
			<Card>{ /* RSS feed settings will go here */ }</Card>
		</>
	);
};
