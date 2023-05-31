import { Card } from '@automattic/components';
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
				{ /* @ts-expect-error FormLegend is not typed and has a className error */ }
				<FormLegend>{ translate( 'Reader content' ) }</FormLegend>
				<SupportInfo
					text={ translate(
						"Settings that control how the site's content is displayed in the Reader."
					) }
					link="https://wordpress.com/support/reader/"
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
