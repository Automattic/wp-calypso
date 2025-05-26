import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
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
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

class SiteSettingsPerformance extends Component {
	render() {
		const {
			fields,
			handleAutosavingToggle,
			hasManagePluginsFeature,
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
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Performance Settings' ) }
					subtitle={ translate(
						"Explore settings to improve your site's performance. {{learnMoreLink}}Learn more{{/learnMoreLink}}.",
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink
										key="learnMore"
										supportContext="performance"
										showIcon={ false }
									/>
								),
							},
						}
					) }
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

				{ ( siteIsJetpackNonAtomic || ( siteIsAtomic && hasManagePluginsFeature ) ) && (
					<Fragment>
						<QueryJetpackModules siteId={ siteId } />

						<SettingsSectionHeader title={ translate( 'Performance & speed' ) } />

						{ siteIsAtomicPrivate ? (
							<EligibilityWarnings
								isEligible
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
									siteIsAtomic={ siteIsAtomic }
								/>

								<SettingsSectionHeader title={ translate( 'Media' ) } />

								<MediaSettingsPerformance
									siteId={ siteId }
									handleAutosavingToggle={ handleAutosavingToggle }
									onChangeField={ onChangeField }
									isSavingSettings={ isSavingSettings }
									isRequestingSettings={ isRequestingSettings }
									fields={ fields }
									siteIsAtomic={ siteIsAtomic }
								/>
							</>
						) }
					</Fragment>
				) }

				{ ( ! siteIsJetpack || siteIsAtomic ) && (
					<CompactCard>
						<InlineSupportLink supportContext="site-speed" showIcon={ false }>
							{ translate( 'Learn more about site speed and performance' ) }
						</InlineSupportLink>
					</CompactCard>
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

	return {
		hasManagePluginsFeature: siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS ),
		site,
		siteIsJetpack,
		siteIsAtomic,
		siteIsAtomicPrivate,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} );

const getFormSettings = ( settings ) =>
	pick( settings, [
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
