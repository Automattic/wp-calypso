/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import { connectOptions } from './theme-options';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();
const site = sites.getSelectedSite();

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default props => (
	<ConnectedThemeShowcase { ...props }
	options={ [
		'signup',
		'preview',
		'separator',
		'info',
		'support',
		'help'
	] }
	site={ site }
	defaultOption="signup"
	getScreenshotOption={ function() {
		return 'info';
	} }
	source="showcase" />
);
