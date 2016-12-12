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

const MultiSiteThemeShowcase = connectOptions(
	( props ) => (
		<div>
			<SidebarNavigation />
			<ThemesSiteSelectorModal { ...props } sourcePath="/design">
				<ThemeShowcase source="showcase" />
			</ThemesSiteSelectorModal>
		</div>
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
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function() {
			return 'info';
		} } />
);
