import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { A4AFullyManagedSiteSetting } from 'calypso/my-sites/site-settings/a4a-fully-managed-site-setting';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useIsAgencySettingSupported from './hooks/use-is-agency-setting-supported';

interface Fields {
	is_fully_managed_agency_site: boolean;
}

type AgencySettingsProps = {
	fields: Fields;
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	handleToggle: ( field: string ) => () => void;
	updateFields: ( fields: Fields ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
};

const AgencySettings = ( {
	fields,
	handleSubmitForm,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
}: AgencySettingsProps ) => {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();
	const isSupported = useIsAgencySettingSupported();

	const renderNotSupportedNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-warning">
				{ translate( 'This setting is not supported for non-agency sites.' ) }
			</Notice>
		);
	};

	const renderSetting = () => {
		return (
			site && (
				<A4AFullyManagedSiteSetting
					title={ translate( 'Client Access' ) }
					site={ site }
					isFullyManagedAgencySite={ fields.is_fully_managed_agency_site }
					onChange={ handleToggle( 'is_fully_managed_agency_site' ) }
					isSaving={ isSavingSettings }
					onSaveSetting={ handleSubmitForm }
					disabled={ isRequestingSettings || isSavingSettings }
				/>
			)
		);
	};

	return (
		<div className="agency-settings">
			<NavigationHeader title={ translate( 'Agency' ) } />
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</div>
	);
};

const getFormSettings = ( settings: Fields ) => {
	if ( ! settings ) {
		return {
			is_fully_managed_agency_site: true,
		};
	}

	return {
		is_fully_managed_agency_site: settings.is_fully_managed_agency_site,
	};
};

export default wrapSettingsForm( getFormSettings )( AgencySettings );
