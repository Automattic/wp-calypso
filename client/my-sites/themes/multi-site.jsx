/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const MultiSiteThemeShowcase = connectOptions( props => (
	<div>
		<SidebarNavigation />
		<ThemesSiteSelectorModal { ...props }>
			<ThemeShowcase source="showcase" showUploadButton={ false } />
		</ThemesSiteSelectorModal>
	</div>
) );

export default props => (
	<MultiSiteThemeShowcase
		{ ...props }
		origin="wpcom"
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function() {
			return 'info';
		} }
	/>
);
