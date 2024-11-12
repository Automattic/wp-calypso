import { SiteSettings as SiteSettingsType } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import SiteSettingPrivacy from 'calypso/sites/settings/site/privacy';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSiteOption } from 'calypso/state/sites/selectors';
import LaunchSite from './visibility/launch-site';

import './style.scss';

interface Fields {
	blog_public: number;
	wpcom_coming_soon: number;
	wpcom_public_coming_soon: number;
	wpcom_data_sharing_opt_out: boolean;
}

interface SiteSettingsProps {
	fields: Fields;
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	updateFields: ( fields: Fields ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
}

const SiteSettings = ( {
	fields,
	handleSubmitForm,
	updateFields,
	isRequestingSettings,
	isSavingSettings,
}: SiteSettingsProps ) => {
	const translate = useTranslate();
	const isUnlaunchedSite = useSelectedSiteSelector( getIsUnlaunchedSite );
	const editingToolkitIsActive = useSelectedSiteSelector(
		getSiteOption,
		'editing_toolkit_is_active'
	);
	const isAtomic = useSelectedSiteSelector( isAtomicSite );
	const isAtomicAndEditingToolkitDeactivated = isAtomic && editingToolkitIsActive === false;
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );

	return (
		<div className="settings-site">
			<NavigationHeader
				title={ translate( 'Site' ) }
				subtitle={ translate( 'Manage your site settings, including site visibility, and more.' ) }
			/>
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

const getFormSettings = ( settings: SiteSettingsType ): Fields | unknown => {
	if ( ! settings ) {
		return {};
	}

	const { blog_public, wpcom_coming_soon, wpcom_public_coming_soon, wpcom_data_sharing_opt_out } =
		settings;
	return { blog_public, wpcom_coming_soon, wpcom_public_coming_soon, wpcom_data_sharing_opt_out };
};

export default wrapSettingsForm( getFormSettings )( SiteSettings );
