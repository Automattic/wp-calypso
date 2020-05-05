/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import AmpJetpack from 'my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'my-sites/site-settings/amp/wpcom';
import DocumentHead from 'components/data/document-head';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'components/main';
import MediaSettingsPerformance from 'my-sites/site-settings/media-settings-performance';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import Search from 'my-sites/site-settings/search';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SpeedUpYourSite from 'my-sites/site-settings/speed-up-site-settings';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isPrivateSite from 'state/selectors/is-private-site';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';

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
			siteIsAtomicPrivate,
			siteIsUnlaunched,
			siteSlug,
			submitForm,
			translate,
			trackEvent,
			updateFields,
		} = this.props;

		return (
			<Main className="settings-performance site-settings site-settings__performance-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<JetpackDevModeNotice />
				<SidebarNavigation />
				<FormattedHeader
					className="settings-performance__page-heading"
					headerText={ translate( 'Settings' ) }
					align="left"
				/>
				<SiteSettingsNavigation site={ site } section="performance" />

				<Search
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>

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
	const siteIsAtomicPrivate =
		isSiteAutomatedTransfer( state, siteId ) && isPrivateSite( state, siteId );

	return {
		site,
		siteIsJetpack,
		siteIsAtomicPrivate,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
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
