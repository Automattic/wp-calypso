/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import AmpJetpack from 'calypso/my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'calypso/my-sites/site-settings/amp/wpcom';
import Cloudflare from 'calypso/my-sites/site-settings/cloudflare';
import DocumentHead from 'calypso/components/data/document-head';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'calypso/components/main';
import MediaSettingsPerformance from 'calypso/my-sites/site-settings/media-settings-performance';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import Search from 'calypso/my-sites/site-settings/search';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import SpeedUpYourSite from 'calypso/my-sites/site-settings/speed-up-site-settings';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { isJetpackSearch, isP2Plus, planHasJetpackSearch } from '@automattic/calypso-products';

function SiteSettingsPerformance( props ) {
	const {
		fields,
		handleAutosavingToggle,
		hasSearchProduct,
		isRequestingSettings,
		isSavingSettings,
		onChangeField,
		saveJetpackSettings,
		showCloudflare,
		site,
		siteId,
		siteIsAtomic,
		siteIsAtomicPrivate,
		siteIsJetpack,
		siteIsUnlaunched,
		siteSlug,
		submitForm,
		trackEvent,
		translate,
		updateFields,
	} = props;
	const siteIsJetpackNonAtomic = siteIsJetpack && ! siteIsAtomic;

	const { isLoading, experimentAssignment } = useExperiment(
		'jetpack_search_performance_settings_placement',
		// Targets experiment assignments to users without search purchases but eligible for Cloudflare promo.
		{ isEligible: showCloudflare && ! siteIsJetpackNonAtomic && ! hasSearchProduct }
	);
	const isJetpackNudgeAtTop = experimentAssignment?.variation === 'treatment';

	return (
		<Main className="settings-performance site-settings site-settings__performance-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="settings-performance__page-heading"
				headerText={ translate( 'Settings' ) }
				subHeaderText={ translate( "Explore settings to improve your site's performance." ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="performance" />

			{ isLoading ? (
				// Renders two placeholders: One for Search and another for Cloudflare.
				<Fragment>
					<div className="settings-performance__loading-placeholder" />
					<div className="settings-performance__loading-placeholder" />
				</Fragment>
			) : (
				<Fragment>
					{ ! isJetpackNudgeAtTop && showCloudflare && ! siteIsJetpackNonAtomic && <Cloudflare /> }
					<Search
						handleAutosavingToggle={ handleAutosavingToggle }
						updateFields={ updateFields }
						submitForm={ submitForm }
						saveJetpackSettings={ saveJetpackSettings }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
						trackEvent={ trackEvent }
					/>

					{ isJetpackNudgeAtTop && showCloudflare && ! siteIsJetpackNonAtomic && <Cloudflare /> }
				</Fragment>
			) }

			{ siteIsJetpack && (
				<Fragment>
					<QueryJetpackModules siteId={ siteId } />

					<SettingsSectionHeader title={ translate( 'Performance & speed' ) } />

					{ siteIsAtomicPrivate ? (
						<EligibilityWarnings
							isEligible={ true }
							backUrl={ `/settings/performance/${ siteSlug }` }
							eligibilityData={ {
								eligibilityHolds: [ siteIsUnlaunched ? 'SITE_UNLAUNCHED' : 'SITE_NOT_PUBLIC' ],
							} }
						/>
					) : (
						<>
							<SpeedUpYourSite
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								submitForm={ submitForm }
								updateFields={ updateFields }
							/>

							<SettingsSectionHeader title={ translate( 'Media' ) } />

							<MediaSettingsPerformance
								siteId={ siteId }
								handleAutosavingToggle={ handleAutosavingToggle }
								onChangeField={ onChangeField }
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								fields={ fields }
							/>
						</>
					) }
				</Fragment>
			) }

			{ siteIsJetpack ? (
				<AmpJetpack />
			) : (
				<AmpWpcom
					submitForm={ submitForm }
					trackEvent={ trackEvent }
					updateFields={ updateFields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			) }
		</Main>
	);
}

const checkForSearchProduct = ( purchase ) =>
	purchase.active && ( isJetpackSearch( purchase ) || isP2Plus( purchase ) );

const connectComponent = connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsAtomic = isSiteAutomatedTransfer( state, siteId );
	const siteIsAtomicPrivate = siteIsAtomic && isPrivateSite( state, siteId );
	const showCloudflare = config.isEnabled( 'cloudflare' );
	const hasSearchProduct =
		getSitePurchases( state, siteId ).find( checkForSearchProduct ) ||
		planHasJetpackSearch( site.plan?.product_slug );

	return {
		hasSearchProduct,
		site,
		siteIsJetpack,
		siteIsAtomic,
		siteIsAtomicPrivate,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		showCloudflare,
	};
} );

const getFormSettings = partialRight( pick, [
	'amp_is_enabled',
	'amp_is_supported',
	'instant_search_enabled',
	'jetpack_search_enabled',
	'jetpack_search_supported',
	'lazy-images',
	'photon',
	'photon-cdn',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsPerformance );
