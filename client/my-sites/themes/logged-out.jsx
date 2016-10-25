/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import { ThemeOptions } from './theme-options';

export default props => (
	<ThemeOptions { ...props }
	options={ [
		'signup',
		'preview',
		'separator',
		'info',
		'support',
		'help'
	] }
	defaultOption="signup"
	getScreenshotOption={ function() {
		return 'info';
	} }
	source="showcase">
		<ThemeShowcase { ...props } />
	</ThemeOptions>
);
