/**
 * Internal dependencies
 */
import stores from './mock-registry/stores';
import { withRegistryProvider, withThemeByClassName } from './decorators';
import './style.scss';

const siteKeys = Object.keys( stores );

export const globalTypes = {
	site: {
		name: 'Site',
		description: 'Site for testing',
		defaultValue: siteKeys[ 0 ],
		toolbar: {
			icon: 'home',
			items: siteKeys,
		},
	},
};

export const decorators = [ withRegistryProvider, withThemeByClassName ];
