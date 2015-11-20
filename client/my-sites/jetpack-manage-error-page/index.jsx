/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	merge = require( 'lodash/object/merge' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	EmptyContent = require( 'components/empty-content' );

module.exports = React.createClass( {

	displayName: 'JetpackManageErrorPage',

	mixins: [ 'pluginsData' ],

	actionCallbacks: {
		updateJetpack: 'actionCallbackUpdate',
		optInManage: 'actionCallbackActivate'
	},

	actionCallbackActivate: function() {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.site ? this.props.site.ID : null );
	},

	actionCallbackUpdate: function() {
		analytics.ga.recordEvent( 'Jetpack', 'Update jetpack', 'Site', this.props.site ? this.props.site.ID : null );
	},

	getSettings: function() {
		var version = this.props.version || '3.4', defaults;
		defaults = {
			updateJetpack: {
				title: this.translate( 'Your version of Jetpack is out of date.' ),
				line: this.translate( 'Jetpack %(version)s or higher is required to see this page.', { args: { version: version } } ),
				action: this.translate( 'Update Jetpack' ),
				illustration: null,
				actionURL: ( this.props.site && this.props.site.jetpack ) ?
				'../../plugins/jetpack/' + this.props.site.slug :
					false,
				version: version
			},
			optInManage: {
				line: this.translate( 'Remote management is required to see this page.' ),
				title: null,
				illustration: null,
				action: this.translate( 'Turn on remote management' ),
				actionURL: ( this.props.site && this.props.site.jetpack ) ?
					this.props.site.getRemoteManagementURL() :
					false,
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

	render: function() {
		var settings = this.getSettings();
		if ( this.actionCallbacks[ this.props.template ] ) {
			settings.actionCallback = this[ this.actionCallbacks[ this.props.template ] ];
		}
		return React.createElement( EmptyContent, settings );
	}

} );
