import { __ } from '@wordpress/i18n';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import NavigationHeader from 'calypso/components/navigation-header';
import { A4AFullyManagedSiteSetting } from 'calypso/my-sites/site-settings/a4a-fully-managed-site-setting';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const AgencySettings = ( {
	fields,
	handleSubmitForm,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
} ) => {
	const site = useSelector( getSelectedSite );
	const isAtomicSite = site.is_wpcom_atomic;

	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID } );

	const shouldShowToggle = agencySite && isAtomicSite;

	return (
		<div className="agency-settings">
			<NavigationHeader title={ __( 'Agency' ) } />
			{ shouldShowToggle && (
				<A4AFullyManagedSiteSetting
					title={ __( 'Client Access' ) }
					site={ site }
					isFullyManagedAgencySite={ fields.is_fully_managed_agency_site }
					onChange={ handleToggle( 'is_fully_managed_agency_site' ) }
					isSaving={ isSavingSettings }
					onSaveSetting={ handleSubmitForm }
					disabled={ isRequestingSettings || isSavingSettings }
				/>
			) }
			{ ! shouldShowToggle && (
				<div>
					<p>{ __( 'Agency settings are not available for this site.' ) }</p>
				</div>
			) }
		</div>
	);
};

const getFormSettings = ( settings ) => {
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
