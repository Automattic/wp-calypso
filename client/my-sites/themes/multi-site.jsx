/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();
const site = sites.getSelectedSite();

const MultiSiteThemeShowcase = connectOptions(
	( props ) => (
		<ThemesSiteSelectorModal { ...props } sourcePath="/design">
			<ThemeShowcase source="showcase">
				<SidebarNavigation />
			</ThemeShowcase>
		</ThemesSiteSelectorModal>
	)
);

export default ( props ) => (
	<MultiSiteThemeShowcase { ...props }
		options={ [
			'preview',
			'purchase',
			'activate',
			'tryandcustomize',
			'separator',
			'info',
			'support',
			'help',
		] }
		site={ site }
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function() {
			return 'info';
		} } />
);
