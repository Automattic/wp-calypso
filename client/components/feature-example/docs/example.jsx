/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import FeatureExample from '../index'
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item'

module.exports = React.createClass( {
	displayName: 'FeatureExample',

	getContent: function() {
		const plugins = [ {
			slug: 'akismet',
			name: 'Akismet',
			wporg: true,
			icon: '//ps.w.org/akismet/assets/icon-256x256.png'
		}, {
			slug: 'wp-super-cache',
			name: 'WP Super Cache',
			wporg: true,
			icon: '//ps.w.org/wp-super-cache/assets/icon-256x256.png'
		}, {
			slug: 'jetpack',
			name: 'Jetpack by WordPress.com',
			wporg: true,
			icon: '//ps.w.org/jetpack/assets/icon-256x256.png'
		} ];
		const selectedSite = {
			slug: 'no-slug',
			canUpdateFiles: true,
			name: 'Not a real site'
		};

		let n = 0;
		return plugins.map( plugin => {
			return <PluginItem
				key={ 'plugin-item-mock-' + n++ }
				plugin={ plugin }
				sites={ [] }
				selectedSite={ selectedSite }
				progress={ [] } />
		} );
	},

	render() {
		return (
			<FeatureExample>
				{ this.getContent() }
			</FeatureExample>
		);
	}
} );

