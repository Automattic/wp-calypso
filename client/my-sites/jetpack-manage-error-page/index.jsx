/**
 * External dependencies
 */
import React from 'react/addons'
import merge from 'lodash/object/merge'

/**
 * Internal dependencies
 */
import analytics from 'analytics'
import EmptyContent from 'components/empty-content'
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item'
import FeatureExample from 'components/feature-example'

module.exports = React.createClass( {

	displayName: 'JetpackManageErrorPage',

	mockedPlugins: 0,

	mixins: [ 'pluginsData' ],

	actionCallbacks: {
		updateJetpack: 'actionCallbackUpdate',
		optInManage: 'actionCallbackActivate'
	},

	actionCallbackActivate() {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.site ? this.props.site.ID : null );
	},

	actionCallbackUpdate() {
		analytics.ga.recordEvent( 'Jetpack', 'Update jetpack', 'Site', this.props.site ? this.props.site.ID : null );
	},

	getSettings() {
		const version = this.props.version || '3.4';
		const defaults = {
			updateJetpack: {
				title: this.translate( 'Your version of Jetpack is out of date.' ),
				line: this.translate( 'Jetpack %(version)s or higher is required to see this page.', { args: { version: version } } ),
				action: this.translate( 'Update Jetpack' ),
				illustration: null,
				actionURL: ( this.props.site && this.props.site.jetpack )
					? '../../plugins/jetpack/' + this.props.site.slug
					: false,
				version: version
			},
			optInManage: {
				title: this.translate( 'Looking to manage this site\'s plugins?' ),
				line: this.translate( 'We need you to enable the Manage feature in the Jetpack plugin on your remote site' ),
				illustration: null,
				action: this.translate( 'Enable Jetpack Manage' ),
				actionURL: ( this.props.site && this.props.site.jetpack )
					? this.props.site.getRemoteManagementURL()
					: false,
				actionTarget: '_blank'
			},
			noDomainsOnJetpack: {
				title: this.translate( 'Domains are not available for this site.' ),
				line: this.translate( 'You can only purchase domains for sites hosted on WordPress.com at this time.' ),
				action: this.translate( 'View Plans' ),
				actionURL: '/plans/' + ( this.props.site ? this.props.site.slug : '' )
			},
			default: {}
		};
		return merge( defaults[ this.props.template ] || defaults.default, this.props );
	},

	getMockPluginItems: function() {
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
		}

		return plugins.map( plugin => {
			return <PluginItem
				key={ 'plugin-item-mock-' + this.mockedPlugins ++ }
				plugin={ plugin }
				sites={ [] }
				selectedSite={ selectedSite }
				progress={ [] }
				isMock={ true } />
		} );
	},

	render() {
		const settings = this.getSettings();
		if ( this.actionCallbacks[ this.props.template ] ) {
			settings.actionCallback = this[ this.actionCallbacks[ this.props.template ] ];
		}
		const emptyContent = React.createElement( EmptyContent, settings );

		return (
			<div>
				{ emptyContent }
				<FeatureExample>
					{ this.getMockPluginItems() }
				</FeatureExample>
			</div>
		)
	}

} );
