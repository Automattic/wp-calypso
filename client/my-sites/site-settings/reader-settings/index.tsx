import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import FormLegend from 'calypso/components/forms/form-legend';
import SupportInfo from 'calypso/components/support-info';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

type ReaderSettingsSectionProps = {
	isAtomic: boolean | null;
	siteIsJetpack: boolean | null;
};

const ReaderSettingsSection = ( { isAtomic, siteIsJetpack }: ReaderSettingsSectionProps ) => {
	const translate = useTranslate();

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader title={ translate( 'Reader settings' ) } />
			<Card className="site-settings__card">
				<FormLegend>{ translate( 'Reader content' ) }</FormLegend>
				<SupportInfo
					text={ translate(
						"Settings that control how the site's content is displayed in the Reader."
					) }
					link={ localizeUrl( 'https://wordpress.com/support/reader/' ) }
					privacyLink={ siteIsJetpack && ! isAtomic }
				/>
			</Card>
		</>
	);
};

export default ReaderSettingsSection;
