/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import { connectOptions } from './theme-options';

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
