/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const MultiSiteThemeShowcase = connectOptions( props => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<Main className="themes">
		<SidebarNavigation />
		<ThemesSiteSelectorModal { ...props }>
			<ThemeShowcase source="showcase" showUploadButton={ false } />
		</ThemesSiteSelectorModal>
	</Main>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
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
