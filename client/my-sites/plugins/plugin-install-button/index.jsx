/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	PluginsActions = require( 'lib/plugins/actions' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	InfoPopover = require( 'components/info-popover' ),
	ExternalLink = require( 'components/external-link' ),
	utils = require( 'lib/site/utils' );

module.exports = React.createClass( {

	displayName: 'PluginInstallButton',

	installAction: function() {
		if ( this.props.isInstalling ) {
			return;
		}
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

	getDisabledInfo: function() {
		if ( ! this.props.selectedSite ) { // we don't have enough info
			return null;
		}

		if ( this.props.selectedSite.options.is_multi_network ) {
			return this.translate( '%(site)s is part of a multi-network installation, which is not currently supported.', {
				args: { site: this.props.selectedSite.title }
			} );
		}

		if ( ! utils.isMainNetworkSite( this.props.selectedSite ) ) {
			return this.translate( 'Only the main site on a multi-site installation can install plugins.', {
				args: { site: this.props.selectedSite.title }
			} );
		}

		if ( ! this.props.selectedSite.canUpdateFiles && this.props.selectedSite.options.file_mod_disabled ) {
			let reasons = utils.getSiteFileModDisableReason( this.props.selectedSite, 'modifyFiles' );
			let html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ this.translate( 'Plugin install is not available for %(site)s:', { args: { site: this.props.selectedSite.title } } ) }
					</p>
				);
				let list = reasons.map( ( reason, i ) => ( <li key={ 'reason-i' + i + '-' + this.props.selectedSite.ID } >{ reason }</li> ) );
				html.push( <ul className="plugin-action__disabled-info-list" key="reason-shell-list">{ list }</ul> );
			} else {
				html.push(
					<p key="reason-shell">{
						this.translate( 'Plugin install is not available for %(site)s. %(reason)s', {
							args: { site: this.props.selectedSite.title, reason: reasons[0] }
						} )
					}</p> );
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={
						analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked How do I fix disabled plugin installs' )
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

	togglePopover: function( event ) {
		this.refs.infoPopover._onClick( event );
	},

	renderUnreachableNotice: function() {
		return (
			<div className={ classNames( { 'plugin-install-button__install': true, embed: this.props.isEmbed } ) }>
				<span onClick={ this.togglePopover } ref="disabledInfoLabel" className="plugin-install-button__warning">{ this.translate( 'Site unreachable' ) }</span>
				<InfoPopover
						position="bottom left"
						popoverName={ 'Plugin Action Disabled Install' }
						gaEventCategory="Plugins"
						ref="infoPopover"
						ignoreContext={ this.refs && this.refs.disabledInfoLabel }
						>
						<div>
							<p>{ this.translate( '%(site)s is unresponsive.', { args: { site: this.props.selectedSite.title } } ) }</p>
							<ExternalLink
								key='external-link'
								onClick={
									analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked How do I fix disabled plugin installs unresponsive site.' )
								}
								href={ 'http://jetpack.me/support/debug/?url=' + this.props.selectedSite.URL }
								>
								{ this.translate( 'Debug site!' ) }
							</ExternalLink>
						</div>
					</InfoPopover>
			</div>
		);
	},

	renderDisabledNotice: function() {
		if ( ! this.props.selectedSite.canUpdateFiles ) {
			if ( ! this.props.selectedSite.hasMinimumJetpackVersion ) {
				return (
					<div className={ classNames( { 'plugin-install-button__install': true, embed: this.props.isEmbed } ) }>
						<span className="plugin-install-button__warning">{ this.translate( 'Jetpack 3.7 is required' ) }</span>
						<Button compact={ true } onclick={ this.updateJetpackAction } href={ this.props.selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' } >{ this.translate( 'update', { context: 'verb, update plugin button label' } ) }</Button>
					</div>
				);
			}

			if ( this.getDisabledInfo() ) {
				return (
					<div className={ classNames( { 'plugin-install-button__install': true, embed: this.props.isEmbed } ) } >
						<span onClick={ this.togglePopover } ref="disabledInfoLabel" className="plugin-install-button__warning">{ this.translate( 'Install Disabled' ) }</span>
						<InfoPopover
							position="bottom left"
							popoverName={ 'Plugin Action Disabled Install' }
							gaEventCategory="Plugins"
							ref="infoPopover"
							ignoreContext={ this.refs && this.refs.disabledInfoLabel }
							>
							{ this.getDisabledInfo() }
						</InfoPopover>
					</div>
				);
			}
			return null;
		}
	},

	renderButton: function() {
		const label = this.props.isInstalling ? this.translate( 'Installing…' ) : this.translate( 'Install' );

		if ( this.props.isEmbed ) {
			return (
				<span className="plugin-install-button__install embed">
					{ this.props.isInstalling
						? <span className="plugin-install-button__installing">{ label }</span>
						: <Button compact={ true } onClick={ this.installAction } >
							<Gridicon key="plus-icon" icon="plus-small" size={ 18 } /><Gridicon icon="plugins" size={ 18 } /> { this.translate( 'Install' ) }
						</Button>
					}
				</span>
			);
		}

		return (
			<span className="plugin-install-button__install">
				<a onClick={ this.installAction } className="button is-primary" disabled={ this.props.isInstalling } >
					{ label }
				</a>
			</span>
		);
	},

	render: function() {
		if ( this.props.selectedSite.unreachable ) {
			return this.renderUnreachableNotice();
		}
		if ( ! this.props.selectedSite.canUpdateFiles ) {
			return this.renderDisabledNotice();
		}

		return this.renderButton();
	}
} );

