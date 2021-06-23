/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import { siteHasScanProductPurchase } from 'calypso/state/purchases/selectors';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import isSiteFailedMigrationSource from 'calypso/state/selectors/is-site-failed-migration-source';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import versionCompare from 'calypso/lib/version-compare';

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

		if ( section === 'guidedTransfer' ) {
			// Dont show the navigation for guided transfer since it includes its own back navigation
			return null;
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
						path={ `/settings/writing/${ site.slug }` }
						preloadSectionName="settings-writing"
						selected={ section === 'writing' }
					>
						{ strings.writing }
					</NavItem>

					<NavItem
						path={ `/settings/discussion/${ site.slug }` }
						preloadSectionName="settings-discussion"
						selected={ section === 'discussion' }
					>
						{ strings.discussion }
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
			( siteHasScanProductPurchase( state, siteId ) ||
				isRewindActive( state, siteId ) ||
				isSiteFailedMigrationSource( state, siteId ) ),
	};
} )( localize( SiteSettingsNavigation ) );
