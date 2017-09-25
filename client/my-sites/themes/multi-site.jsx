/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const MultiSiteThemeShowcase = connectOptions(
	( props ) => (
		<div>
			<SidebarNavigation />
			<ThemesSiteSelectorModal { ...props }>
				<ThemeShowcase
					source="showcase"
					showUploadButton={ false } />
			</ThemesSiteSelectorModal>
		</div>
	)
);

export default ( props ) => (
	<MultiSiteThemeShowcase { ...props }
		origin="wpcom"
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function() {
			return 'info';
		} } />
);
