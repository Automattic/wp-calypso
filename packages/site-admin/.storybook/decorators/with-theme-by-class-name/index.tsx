/**
 * External dependencies
 */
import { withThemeByClassName } from '@storybook/addon-themes';

export default withThemeByClassName( {
	themes: {
		auto: 'theme-auto',
		'site admin': 'theme-admin-app',
	},
	defaultTheme: 'site admin',
	parentSelector: 'body',
} );
