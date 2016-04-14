/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginsActions = require( 'lib/plugins/actions' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginAction = require( 'my-sites/plugins/plugin-action/plugin-action' ),
	ExternalLink = require( 'components/external-link' ),
	analytics = require( 'lib/analytics' ),
	utils = require( 'lib/site/utils' );

module.exports = React.createClass( {

	displayName: 'PluginAutopdateToggle',

	propTypes: {
		isMock: React.PropTypes.bool,
		site: React.PropTypes.object.isRequired,
		plugin: React.PropTypes.object.isRequired,
		wporg: React.PropTypes.bool
	},

	toggleAutoupdates: function() {
		if ( this.props.isMock || this.props.disabled ) {
			return;
		}

		PluginsActions.togglePluginAutoUpdate( this.props.site, this.props.plugin );
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );

		if ( this.props.plugin.autoupdate ) {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Disable Autoupdates Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_autoupdate_disable_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		} else {
			analytics.ga.recordEvent( 'Plugins', 'Clicked Toggle Enable Autoupdates Plugin', 'Plugin Name', this.props.plugin.slug );
			analytics.tracks.recordEvent( 'calypso_plugin_autoupdate_enable_click', {
				site: this.props.site.ID,
				plugin: this.props.plugin.slug
			} );
		}
	},

	getDisabledInfo: function() {
		if ( ! this.props.site ) { // we don't have enough info
			return null;
		}

		if ( ! this.props.wporg ) {
			return this.translate( 'This plugin is not in the WordPress.org plugin repository, so we can\'t autoupdate it.' );
		}

		if ( ! this.props.site.hasMinimumJetpackVersion ) {
			return this.translate( '%(site)s is not running an up to date version of Jetpack', {
				args: { site: this.props.site.title }
			} );
		}

		if ( this.props.site.options.is_multi_network ) {
			return this.translate( '%(site)s is part of a multi-network installation, which is not currently supported.', {
				args: { site: this.props.site.title }
			} );
		}

		if ( ! utils.isMainNetworkSite( this.props.site ) ) {
			return this.translate( 'Only the main site on a multi-site installation can enable autoupdates for plugins.', {
				args: { site: this.props.site.title }
			} );
		}

		if ( ! this.props.site.canAutoupdateFiles && this.props.site.options.file_mod_disabled ) {
			let reasons = utils.getSiteFileModDisableReason( this.props.site, 'autoupdateFiles' );
			let html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ this.translate( 'Autoupdates are not available for %(site)s:', { args: { site: this.props.site.title } } ) }
					</p>
				);
				let list = reasons.map( ( reason, i ) => ( <li key={ 'reason-i' + i + '-' + this.props.site.ID } >{ reason }</li> ) );
				html.push( <ul className="plugin-action__disabled-info-list" key="reason-shell-list">{ list }</ul> );
			} else {
				html.push(
					<p key="reason-shell">{
						this.translate( 'Autoupdates are not available for %(site)s. %(reason)s', {
							args: { site: this.props.site.title, reason: reasons[0] }
						} )
					}</p> );
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={
						analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked How do I fix disabled autoupdates' )
					}
					href="https://jetpack.me/support/site-management/#file-update-disabled"
					>
					{ this.translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	},

	render: function() {
		if ( ! this.props.site.jetpack ) {
			return null;
		}

		const inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [
				'ENABLE_AUTOUPDATE_PLUGIN',
				'DISABLE_AUTOUPDATE_PLUGIN'
			] ),
			getDisabledInfo = this.getDisabledInfo(),
			label = getDisabledInfo
				? this.translate( 'Autoupdates disabled', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates disabled" active'
				} )
				: this.translate( 'Autoupdates', {
					context: 'this goes next to an icon that displays if the plugin has "autoupdates" active'
				} );

		return (
			<PluginAction
				disabled={ this.props.disabled }
				label={ label }
				status={ this.props.plugin.autoupdate }
				action={ this.toggleAutoupdates }
				inProgress={ inProgress }
				disabledInfo={ getDisabledInfo }
				htmlFor={ 'autoupdates-' + this.props.plugin.slug + '-' + this.props.site.ID } />
		);
	}
} );
