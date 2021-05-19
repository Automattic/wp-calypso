/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import InstallThemeButton from './install-theme-button';

const MultiSiteThemeShowcase = connectOptions( () => (
	<Main fullWidthLayout className="themes">
		<SidebarNavigation />
		<InstallThemeButton />
		<ThemeShowcase source="showcase" showUploadButton={ false } />
	</Main>
) );

export default ( props ) => (
	<MultiSiteThemeShowcase
		{ ...props }
		origin="wpcom"
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function () {
			return 'info';
		} }
	/>
);
