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

// Note this component is not in use as of https://github.com/Automattic/wp-calypso/pull/84828. This
// PR removed the only remaining setting in this component, so this component was removed from
// reading settings page as well. I thought it may make sense to keep this component's definition,
// as we may want to add other reader settings in the future. More necessary props and types for
// settings can be seen on the above PR.
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
