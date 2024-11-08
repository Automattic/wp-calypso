import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import SiteSettingPrivacy from 'calypso/sites/settings/site/privacy';
import LaunchSite from 'calypso/sites/settings/site/visibility/launch-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteTools from '../site-tools';
import { SOURCE_SETTINGS_SITE_TOOLS } from '../site-tools/utils';
import wrapSettingsForm from '../wrap-settings-form';

const SiteSettingsGeneral = ( {
	fields,
	handleSubmitForm,
	updateFields,
	isRequestingSettings,
	isSavingSettings,

	isWpcomStagingSite,
	isAtomicAndEditingToolkitDeactivated,
	isUnlaunchedSite,
} ) => (
	<div className="site-settings__main general-settings">
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
		{ ! isWpcomStagingSite && (
			<SiteTools headerTitle={ translate( 'Other tools' ) } source={ SOURCE_SETTINGS_SITE_TOOLS } />
		) }
	</div>
);

const getFormSettings = ( settings ) => {
	if ( ! settings ) {
		return {};
	}

	const { blog_public, wpcom_coming_soon, wpcom_public_coming_soon } = settings;
	return { blog_public, wpcom_coming_soon, wpcom_public_coming_soon };
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
		isUnlaunchedSite: getIsUnlaunchedSite( state, siteId ),
	};
} )( wrapSettingsForm( getFormSettings )( SiteSettingsGeneral ) );
