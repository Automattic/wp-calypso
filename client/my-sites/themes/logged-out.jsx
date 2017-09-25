/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default props => (
	<ConnectedThemeShowcase { ...props }
		origin="wpcom"
		defaultOption="signup"
		getScreenshotOption={ function() {
			return 'info';
		} }
		source="showcase"
		showUploadButton={ false }
	/>
);
