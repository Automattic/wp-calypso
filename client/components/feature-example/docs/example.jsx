/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import FeatureExample from '..';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';

export default class FeatureExampleExample extends React.Component {
	static displayName = 'FeatureExampleExample';

	getContent = () => {
		const plugins = [
			{
				slug: 'akismet',
				name: 'Akismet',
				wporg: true,
				icon: '//ps.w.org/akismet/assets/icon-256x256.png',
			},
			{
				slug: 'wp-super-cache',
				name: 'WP Super Cache',
				wporg: true,
				icon: '//ps.w.org/wp-super-cache/assets/icon-256x256.png',
			},
			{
				slug: 'jetpack',
				name: 'Jetpack by WordPress.com',
				wporg: true,
				icon: '//ps.w.org/jetpack/assets/icon-256x256.png',
			},
		];
		const selectedSite = {
			slug: 'no-slug',
			canUpdateFiles: true,
			name: 'Not a real site',
		};

		return plugins.map( ( plugin ) => {
			return (
				<PluginItem
					key={ `plugin-item-mock-${ plugin.slug }` }
					plugin={ plugin }
					sites={ [] }
					hasUpdate={ () => false }
					selectedSite={ selectedSite }
					progress={ [] }
				/>
			);
		} );
	};

	render() {
		return <FeatureExample>{ this.getContent() }</FeatureExample>;
	}
}
