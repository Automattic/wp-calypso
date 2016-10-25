/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { ThemeOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

export default props => (
	<ThemeOptions options={ [
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
	} }>
		<ThemesSiteSelectorModal sourcePath="/design">
			<ThemeShowcase { ...props } source="showcase">
				<SidebarNavigation />
			</ThemeShowcase>
		</ThemesSiteSelectorModal>
	</ThemeOptions>
);
