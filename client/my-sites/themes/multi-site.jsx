/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import {
	preview,
	purchase,
	activate,
	tryandcustomize,
	separator,
	info,
	support,
	help
} from './theme-options';
import ThemeShowcase from './theme-showcase';

export default props => (
	<ThemesSiteSelectorModal options={ {
		preview,
		purchase,
		activate,
		tryandcustomize,
		separator,
		info,
		support,
		help,
	} }
	defaultOption="activate"
	secondaryOption="tryandcustomize"
	getScreenshotOption={ function() {
		return 'info';
	} }
	sourcePath="/design">
		<ThemeShowcase { ...props } source="showcase">
			<SidebarNavigation />
		</ThemeShowcase>
	</ThemesSiteSelectorModal>
);
