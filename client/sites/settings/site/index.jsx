import { __ } from '@wordpress/i18n';
import NavigationHeader from 'calypso/components/navigation-header';
import SiteSettingPrivacy from 'calypso/my-sites/site-settings/site-setting-privacy';
import LaunchSite from 'calypso/my-sites/site-settings/site-visibility/launch-site';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSiteOption } from 'calypso/state/sites/selectors';

const SiteSettings = ( {
	fields,
	handleSubmitForm,
	updateFields,
	isRequestingSettings,
	isSavingSettings,
} ) => {
	const isUnlaunchedSite = useSelectedSiteSelector( getIsUnlaunchedSite );
	const editingToolkitIsActive = useSelectedSiteSelector(
		getSiteOption,
		'editing_toolkit_is_active'
	);
	const isAtomic = useSelectedSiteSelector( isAtomicSite );
	const isAtomicAndEditingToolkitDeactivated = isAtomic && editingToolkitIsActive === false;
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );

	return (
		<div className="site-settings">
			<NavigationHeader title={ __( 'Site' ) } />
			{ isUnlaunchedSite && ! isAtomicAndEditingToolkitDeactivated && ! isWpcomStagingSite ? (
				<LaunchSite />
			) : (
				<SiteSettingPrivacy
					fields={ fields }
					handleSubmitForm={ handleSubmitForm }
					updateFields={ updateFields }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
				/>
			) }
		</div>
	);
};

const getFormSettings = ( settings ) => {
	if ( ! settings ) {
		return {};
	}

	const { blog_public, wpcom_coming_soon, wpcom_public_coming_soon } = settings;
	return { blog_public, wpcom_coming_soon, wpcom_public_coming_soon };
};

export default wrapSettingsForm( getFormSettings )( SiteSettings );
