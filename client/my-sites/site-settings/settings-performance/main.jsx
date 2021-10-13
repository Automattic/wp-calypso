import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import AmpJetpack from 'calypso/my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'calypso/my-sites/site-settings/amp/wpcom';
import Cloudflare from 'calypso/my-sites/site-settings/cloudflare';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import MediaSettingsPerformance from 'calypso/my-sites/site-settings/media-settings-performance';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import Search from 'calypso/my-sites/site-settings/search';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import SpeedUpYourSite from 'calypso/my-sites/site-settings/speed-up-site-settings';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

class SiteSettingsPerformance extends Component {
	render() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			site,
			siteId,
			siteIsJetpack,
			siteIsAtomic,
			siteIsAtomicPrivate,
			siteIsUnlaunched,
			siteSlug,
			showCloudflare,
			submitForm,
			translate,
			trackEvent,
			updateFields,
			saveJetpackSettings,
			activateModule,
		} = this.props;
		const siteIsJetpackNonAtomic = siteIsJetpack && ! siteIsAtomic;

		return (
			<Main className="settings-performance site-settings site-settings__performance-settings">
				<DocumentHead title={ translate( 'Performance Settings' ) } />
				<JetpackDevModeNotice />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="settings-performance__page-heading"
					headerText={ translate( 'Performance Settings' ) }
					subHeaderText={ translate( "Explore settings to improve your site's performance." ) }
					align="left"
				/>
				<SiteSettingsNavigation site={ site } section="performance" />

				<Search
					handleAutosavingToggle={ handleAutosavingToggle }
					updateFields={ updateFields }
					submitForm={ submitForm }
					saveJetpackSettings={ saveJetpackSettings }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					trackEvent={ trackEvent }
					activateModule={ activateModule }
				/>

				{ showCloudflare && ! siteIsJetpackNonAtomic && <Cloudflare /> }

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
}

const connectComponent = connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsAtomic = isSiteAutomatedTransfer( state, siteId );
	const siteIsAtomicPrivate = siteIsAtomic && isPrivateSite( state, siteId );
	const showCloudflare = config.isEnabled( 'cloudflare' );

	return {
		site,
		siteIsJetpack,
		siteIsAtomic,
		siteIsAtomicPrivate,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		showCloudflare,
	};
} );

const getFormSettings = ( settings ) =>
	pick( settings, [
		'amp_is_enabled',
		'amp_is_supported',
		'instant_search_enabled',
		'jetpack_search_enabled',
		'jetpack_search_supported',
		'lazy-images',
		'photon',
		'photon-cdn',
	] );

export default connectComponent(
	localize( wrapSettingsForm( getFormSettings )( SiteSettingsPerformance ) )
);
