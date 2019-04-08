/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ThemeShowcase from './theme-showcase';
import { connectOptions } from './theme-options';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default props => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<Main className="themes">
		<ConnectedThemeShowcase
			{ ...props }
			origin="wpcom"
			defaultOption="signup"
			getScreenshotOption={ function() {
				return 'info';
			} }
			source="showcase"
			showUploadButton={ false }
		/>
	</Main>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);
