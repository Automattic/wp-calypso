/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import config from 'config';
import EmptyContent from 'components/empty-content';
import JetpackUpgradeMessage from './jetpack-upgrade-message';
import JetpackManageDisabledMessage from './jetpack-manage-disabled-message';
import {
	customize,
	preview,
	purchase,
	activate,
	tryandcustomize,
	separator,
	info,
	support,
	help,
	bindToSite,
	bindOptions
} from './theme-options';
import sitesFactory from 'lib/sites-list';
import { FEATURE_ADVANCED_DESIGN } from 'lib/plans/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ThemeShowcase from './theme-showcase';

const sites = sitesFactory();

const JetpackThemeReferrerPage = localize(
	( { translate, site, analyticsPath, analyticsPageTitle } ) => (
		<Main className="themes">
			<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
			<SidebarNavigation />
			<CurrentTheme
				site={ site }
				canCustomize={ site && site.isCustomizable() } />
			<EmptyContent title={ translate( 'Changing Themes?' ) }
				line={ translate( 'Use your site theme browser to manage themes.' ) }
				action={ translate( 'Open Site Theme Browser' ) }
				actionURL={ site.options.admin_url + 'themes.php' }
				actionTarget="_blank"
				illustration="/calypso/images/drake/drake-jetpack.svg" />
		</Main>
	)
);

const BoundThemeShowcase = connect( ...bindOptions )( ThemeShowcase );

const ThemesSingleSiteBase = ( props ) => {
	const site = sites.getSelectedSite(),
		{ analyticsPath, analyticsPageTitle, isJetpack, translate } = props,
		jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );

	// If we've only just switched from single to multi-site, there's a chance
	// this component is still being rendered with site unset, so we need to guard
	// against that case.
	if ( ! site ) {
		return <Main className="themes" />;
	}

	if ( isJetpack ) {
		if ( ! jetpackEnabled ) {
			return (
				<JetpackThemeReferrerPage site={ site }
					analyticsPath={ analyticsPath }
					analyticsPageTitle={ analyticsPageTitle } />
			);
		}
		if ( ! site.hasJetpackThemes ) {
			return <JetpackUpgradeMessage site={ site } />;
		}
		if ( ! site.canManage() ) {
			return <JetpackManageDisabledMessage site={ site } />;
		}
	}

	return (
		<BoundThemeShowcase { ...props }>
			<SidebarNavigation />
			<ThanksModal
				site={ site }
				source={ 'list' } />
			<CurrentTheme
				site={ site }
				canCustomize={ site && site.isCustomizable() } />
			<UpgradeNudge
				title={ translate( 'Get Custom Design with Premium' ) }
				message={ translate( 'Customize your theme using premium fonts, color palettes, and the CSS editor.' ) }
				feature={ FEATURE_ADVANCED_DESIGN }
				event="themes_custom_design"
			/>
		</BoundThemeShowcase>
	);
};

const bindSingleSite = ( state ) => {
	const selectedSite = getSelectedSite( state );
	return {
		selectedSite,
		isJetpack: selectedSite && isJetpackSite( state, selectedSite.ID ),
		isCustomizable: selectedSite && canCurrentUser( state, selectedSite.ID, 'edit_theme_options' )
	};
};

const ThemesSingleSite = connect( bindSingleSite )( localize( ThemesSingleSiteBase ) );

const ThemeShowcaseBoundToSite = connect( bindToSite )( ThemesSingleSite );

export default props => (
	<ThemeShowcaseBoundToSite { ...props }
		options={ {
			customize,
			preview,
			purchase,
			activate,
			tryandcustomize,
			separator,
			info,
			support,
			help
		} }
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function( theme ) {
			return theme.active ? 'customize' : 'info';
		} }
		source="showcase" />
);
