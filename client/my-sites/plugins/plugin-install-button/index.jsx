/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	PluginsActions = require( 'lib/plugins/actions' ),
	AddNewButton = require( 'components/add-new-button' );

module.exports = React.createClass( {

	displayName: 'PluginInstallButton',

	installAction: function() {
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
		PluginsActions.installPlugin( this.props.selectedSite, this.props.plugin );

		if ( this.props.isEmbed ) {
			analytics.ga.recordEvent( 'Plugins', 'Install with no selected site', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_install_click_from_sites_list', {
				site: this.props.selectedSite,
				plugin: this.props.plugin.slug
			} );
		} else {
			analytics.ga.recordEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_install_click_from_plugin_info', {
				site: this.props.selectedSite,
				plugin: this.props.plugin.slug
			} );
		}
	},

	updateJetpackAction: function() {
		analytics.ga.recordEvent( 'Plugins', 'Update jetpack', 'Plugin Name', this.props.plugin.slug );
		analytics.tracks.recordEvent( 'calypso_plugin_update_jetpack', {
			site: this.props.selectedSite,
			plugin: this.props.plugin.slug
		} );
	},

	renderEmbedButton: function() {
		if ( ! this.props.selectedSite.canUpdateFiles ) {
			return (
				<div className="plugin-install-button__install embed has-warning">
					<span className="plugin-install-button__warning">{ this.translate( 'Install Disabled' ) }</span>
				</div>
			);
		}
		if ( ! this.props.selectedSite.hasMinimumJetpackVersion ) {
			return (
				<div className="plugin-install-button__install embed has-warning">
					<span className="plugin-install-button__warning">{ this.translate( 'Jetpack 3.7 is required' ) }</span>
					<a onclick={ this.updateJetpackAction } href={ this.props.selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' } className="plugin-install-button__link">{ this.translate( 'update', { context: 'verb, update plugin button label' } ) }</a>
				</div>
			);
		}
		if ( this.props.isInstalling ) {
			return (
				<span className="plugin-install-button__install embed">
					<span className="plugin-install-button__installing">{ this.translate( 'Installing…' ) }</span>
				</span>
			);
		}
		return (
			<span className="plugin-install-button__install embed">
				<AddNewButton onClick={ this.installAction } icon="plugins" >{ this.translate( 'Install' ) }</AddNewButton>
			</span>
		);
	},

	renderButton: function() {
		if ( ! this.props.selectedSite.canUpdateFiles ) {
			return (
				<div className="plugin-install-button__install has-warning">
					<span className="plugin-install-button__warning">{ this.translate( 'Install Disabled' ) }</span>
				</div>
			);
		}
		if ( this.props.isInstalling ) {
			return (
				<span className="plugin-install-button__install">
					<a className="button is-primary" disabled="disabled" >
						{ this.translate( 'Installing…' ) }
					</a>
				</span>
			);
		}
		return (
			<span className="plugin-install-button__install">
				<a onClick={ this.installAction } className="button is-primary">
					{ this.translate( 'Install' ) }
				</a>
			</span>
		);
	},

	render: function() {
		if ( this.props.selectedSite.isSecondaryNetworkSite() ) {
			return null;
		}

		if ( this.props.isEmbed ) {
			return this.renderEmbedButton();
		}
		return this.renderButton();
	}
} );

