import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormLegend from 'calypso/components/forms/form-legend';
import SupportInfo from 'calypso/components/support-info';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

type Fields = {
	wpcom_reader_views_enabled?: boolean;
};

type ReaderSettingsSectionProps = {
	fields: Fields;
	handleAutosavingToggle: ( field: string ) => () => void;
	isAtomic: boolean | null;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	siteIsJetpack: boolean | null;
};

const ReaderSettingsSection = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	isAtomic,
	siteIsJetpack,
}: ReaderSettingsSectionProps ) => {
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
				<ToggleControl
					checked={ !! fields.wpcom_reader_views_enabled }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'wpcom_reader_views_enabled' ) }
					label={ translate( 'Show post views in Reader' ) }
				/>
			</Card>
		</>
	);
};

export default ReaderSettingsSection;
