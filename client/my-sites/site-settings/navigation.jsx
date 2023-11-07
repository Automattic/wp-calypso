import { WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import versionCompare from 'calypso/lib/version-compare';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteFailedMigrationSource from 'calypso/state/selectors/is-site-failed-migration-source';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteOption, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

export class SiteSettingsNavigation extends Component {
	static propTypes = {
		section: PropTypes.string,
		// Connected props
		site: PropTypes.object,
		shouldShowJetpackSettings: PropTypes.bool,
	};

	getStrings() {
		const { translate } = this.props;
		return {
			general: translate( 'General', { context: 'settings screen' } ),
			performance: translate( 'Performance', { context: 'settings screen' } ),
			reading: translate( 'Reading', { context: 'settings screen' } ),
			writing: translate( 'Writing', { context: 'settings screen' } ),
			discussion: translate( 'Discussion', { context: 'settings screen' } ),
			security: translate( 'Security', { context: 'settings screen' } ),
			jetpack: 'Jetpack',
		};
	}

	render() {
		const { section, site, shouldShowSettings, shouldShowJetpackSettings } = this.props;
		const strings = this.getStrings();
		const selectedText = strings[ section ];

		if ( ! shouldShowSettings ) {
			return null;
		}

		if ( ! site ) {
			return <SectionNav />;
		}

		return (
			<SectionNav selectedText={ selectedText }>
				<NavTabs>
					<NavItem path={ `/settings/general/${ site.slug }` } selected={ section === 'general' }>
						{ strings.general }
					</NavItem>

					{ site.jetpack && (
						<NavItem
							path={ `/settings/security/${ site.slug }` }
							preloadSectionName="settings-security"
							selected={ section === 'security' }
						>
							{ strings.security }
						</NavItem>
					) }

					<NavItem
						path={ `/settings/performance/${ site.slug }` }
						preloadSectionName="settings-performance"
						selected={ section === 'performance' }
					>
						{ strings.performance }
					</NavItem>

					<NavItem
						path={ `/settings/reading/${ site.slug }` }
						preloadSectionName="settings-reading"
						selected={ section === 'reading' }
					>
						{ strings.performance }
					</NavItem>

					<NavItem
						path={ `/settings/writing/${ site.slug }` }
						preloadSectionName="settings-writing"
						selected={ section === 'writing' }
					>
						{ strings.writing }
					</NavItem>

					<NavItem
						path={ `/settings/reading/${ site.slug }` }
						preloadSectionName="settings-reading"
						selected={ section === 'reading' }
					>
						{ strings.reading }
					</NavItem>

					{ shouldShowJetpackSettings && site.jetpack && (
						<NavItem
							path={ `/settings/jetpack/${ site.slug }` }
							preloadSectionName="settings-jetpack"
							selected={ section === 'jetpack' }
						>
							{ strings.jetpack }
						</NavItem>
					) }
				</NavTabs>
			</SectionNav>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	// Do not render if the settings pages can be accessed directly from the sidebar menu (requires https://github.com/Automattic/jetpack/pull/20100).
	let shouldShowSettings = false;
	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		const jetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
		if ( jetpackVersion && versionCompare( jetpackVersion, '9.9-alpha', '<' ) ) {
			shouldShowSettings = true;
		}
	}

	return {
		site,
		shouldShowSettings,
		shouldShowJetpackSettings:
			siteId &&
			isJetpackSectionEnabledForSite( state, siteId ) &&
			( siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) ||
				isRewindActive( state, siteId ) ||
				isSiteFailedMigrationSource( state, siteId ) ),
	};
} )( localize( SiteSettingsNavigation ) );
