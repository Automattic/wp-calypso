/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import accept from 'lib/accept';
import PluginsLog from 'lib/plugins/log-store';
import PluginAction from 'my-sites/plugins/plugin-action/plugin-action';
import PluginsActions from 'lib/plugins/actions';
import ExternalLink from 'components/external-link';
import utils from 'lib/site/utils';

module.exports = React.createClass( {

	displayName: 'PluginRemoveButton',

	removeAction() {
		accept( this.translate( 'Are you sure you want to remove {{strong}}%(pluginName)s{{/strong}} from %(siteName)s? {{br /}} {{em}}This will deactivate the plugin and delete all associated files and data.{{/em}}', {
			components: {
				em: <em />,
				br: <br />,
				strong: <strong />
			},
			args: {
				pluginName: this.props.plugin.name,
				siteName: this.props.site.title
			}
		} ),
			this.processRemovalConfirmation,
			this.translate( 'Remove' )
		);
	},

	processRemovalConfirmation( accepted ) {
		if ( accepted ) {
			PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
			PluginsActions.removePlugin( this.props.site, this.props.plugin );

			if ( this.props.isEmbed ) {
				analytics.ga.recordEvent( 'Plugins', 'Remove plugin with no selected site', 'Plugin Name', this.props.plugin.slug );
				analytics.tracks.recordEvent( 'calypso_plugin_remove_click_from_sites_list', {
					site: this.props.site.ID,
					plugin: this.props.plugin.slug
				} );
			} else {
				analytics.ga.recordEvent( 'Plugins', 'Remove plugin on selected Site', 'Plugin Name', this.props.plugin.slug );
				analytics.tracks.recordEvent( 'calypso_plugin_remove_click_from_plugin_info', {
					site: this.props.site.ID,
					plugin: this.props.plugin.slug
				} );
			}
		}
	},

	getDisabledInfo() {
		if ( ! this.props.site ) { // we don't have enough info
			return null;
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
			return this.translate( '%(pluginName)s cannot be removed because %(site)s is not the main site of the multi-site installation.', {
				args: {
					site: this.props.site.title,
					pluginName: this.props.plugin.name
				}
			} );
		}

		if ( ! this.props.site.canUpdateFiles && this.props.site.options.file_mod_disabled ) {
			const reasons = utils.getSiteFileModDisableReason( this.props.site, 'modifyFiles' );
			const html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ this.translate( '%(pluginName)s cannot be removed:', { args: { pluginName: this.props.plugin.name } } ) }
					</p>
				);
				const list = reasons.map( ( reason, i ) => ( <li key={ 'reason-i' + i + '-' + this.props.site.ID } >{ reason }</li> ) );
				html.push( <ul className="plugin-action__disabled-info-list" key="reason-shell-list">{ list }</ul> );
			} else {
				html.push(
					<p key="reason-shell">
						{ this.translate( '%(pluginName)s cannot be removed. %(reason)s', { args: { pluginName: this.props.plugin.name, reason: reasons[ 0 ] } } ) }
					</p>
				);
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={ analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked How do I fix diabled plugin removal.' ) }
					href="https://jetpack.me/support/site-management/#file-update-disabled"
				>
					{ this.translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	},

	renderButton() {
		const inProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, [
			'REMOVE_PLUGIN'
		] );
		const getDisabledInfo = this.getDisabledInfo();
		const label = getDisabledInfo
			? this.translate( 'Removal Disabled', {
				context: 'this goes next to an icon that displays if site is in a state where it can\'t modify has "Removal Disabled" '
			} )
			: this.translate( 'Remove', { context: 'Verb. Presented to user as a label for a button.' } );
		if ( inProgress ) {
			return (
				<span className="plugin-action plugin-remove-button__remove">
					{ this.translate( 'Removing…' ) }
				</span>
			);
		}
		return (
			<PluginAction
				label={ label }
				htmlFor={ 'remove-plugin-' + this.props.site.ID }
				action={ this.removeAction }
				disabledInfo={ getDisabledInfo }
				className="plugin-remove-button__remove-link"
			>
				<a onClick={ this.removeAction } className="plugin-remove-button__remove-icon" >
					<Gridicon icon="trash" size={ 18 } />
				</a>
			</PluginAction>
		);
	},

	render() {
		if ( ! this.props.site.jetpack ) {
			return null;
		}

		if ( this.props.plugin.slug === 'jetpack' ) {
			return null;
		}

		return this.renderButton();
	}
} );
