import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import { DIFMUpsell } from '../components/difm-upsell-banner';
import { A4AFullyManagedSiteForm } from './agency';
import EnhancedOwnershipForm from './enhanced-ownership';
import FooterCredit from './footer-credit';
import PrivacyForm from './privacy';
import SubscriptionGiftingForm from './subscription-gifting';
import ToolbarForm from './toolbar';
import LaunchSite from './visibility';

export default function SiteSettingsForm( {
	site,
	siteIsJetpack,
	isUnlaunchedSite,
	isAtomicAndEditingToolkitDeactivated,
	isWpcomStagingSite,
	fields,
	updateFields,
	onChangeField,
	handleToggle,
	handleSubmitForm,
	isRequestingSettings,
	isSavingSettings,
	eventTracker,
	uniqueEventTracker,
} ) {
	if ( ! site ) {
		return null;
	}

	return (
		<>
			{ site && <QuerySiteSettings siteId={ site.ID } /> }

			{ isUnlaunchedSite && ! isAtomicAndEditingToolkitDeactivated && ! isWpcomStagingSite ? (
				<LaunchSite />
			) : (
				<PrivacyForm
					fields={ fields }
					handleSubmitForm={ handleSubmitForm }
					updateFields={ updateFields }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
				/>
			) }

			<A4AFullyManagedSiteForm
				site={ site }
				isFullyManagedAgencySite={ fields.is_fully_managed_agency_site }
				onChange={ handleToggle( 'is_fully_managed_agency_site' ) }
				isSaving={ isSavingSettings }
				onSaveSetting={ handleSubmitForm }
				disabled={ isRequestingSettings || isSavingSettings }
			/>

			<EnhancedOwnershipForm
				fields={ fields }
				onChangeField={ onChangeField }
				handleToggle={ handleToggle }
				isSaving={ isSavingSettings }
				onSave={ handleSubmitForm }
				disabled={ isRequestingSettings || isSavingSettings }
				eventTracker={ eventTracker }
				uniqueEventTracker={ uniqueEventTracker }
			/>

			<DIFMUpsell
				site={ site }
				isUnlaunchedSite={ isUnlaunchedSite }
				urlRef="unlaunched-settings"
			/>

			<SubscriptionGiftingForm
				fields={ fields }
				handleToggle={ handleToggle }
				onSave={ handleSubmitForm }
				disabled={ isRequestingSettings || isSavingSettings }
				isSaving={ isSavingSettings }
			/>

			<FooterCredit site={ site } siteIsJetpack={ siteIsJetpack } />

			<ToolbarForm
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
			/>
		</>
	);
}
