/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { ExternalLink } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, trash } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { REMOVE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getSiteFileModDisableReason, isMainNetworkSite } from 'calypso/lib/site/utils';
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';
import { removePlugin } from 'calypso/state/plugins/installed/actions';
import { isPluginActionInProgress } from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { withShowPluginActionDialog } from '../hooks/use-show-plugin-action-dialog';

import './style.scss';

class PluginRemoveButton extends Component {
	static displayName = 'PluginRemoveButton';

	removeAction = () => {
		const { plugin, site, showPluginActionDialog } = this.props;
		showPluginActionDialog( 'remove', [ plugin ], [ site ], this.processRemovalConfirmation );
	};

	processRemovalConfirmation = ( accepted ) => {
		if ( accepted ) {
			this.props.removePluginStatuses( 'completed', 'error', 'up-to-date' );
			this.props.removePlugin( this.props.site.ID, this.props.plugin );

			if ( this.props.isEmbed ) {
				gaRecordEvent(
					'Plugins',
					'Remove plugin with no selected site',
					'Plugin Name',
					this.props.plugin.slug
				);
				recordTracksEvent( 'calypso_plugin_remove_click_from_sites_list', {
					site: this.props.site.ID,
					plugin: this.props.plugin.slug,
				} );
			} else {
				gaRecordEvent(
					'Plugins',
					'Remove plugin on selected Site',
					'Plugin Name',
					this.props.plugin.slug
				);
				recordTracksEvent( 'calypso_plugin_remove_click_from_plugin_info', {
					site: this.props.site.ID,
					plugin: this.props.plugin.slug,
				} );
			}
		}
	};

	getDisabledInfo = () => {
		if ( ! this.props.site || ! this.props.site.options ) {
			// we don't have enough info
			return null;
		}

		if ( this.props.site.options.is_multi_network ) {
			return this.props.translate(
				'%(site)s is part of a multi-network installation, which is not currently supported.',
				{
					args: { site: this.props.site.title },
				}
			);
		}

		if ( ! isMainNetworkSite( this.props.site ) ) {
			return this.props.translate(
				'%(pluginName)s cannot be removed because %(site)s is not the main site of the multi-site installation.',
				{
					args: {
						site: this.props.site.title,
						pluginName: this.props.plugin.name,
					},
				}
			);
		}

		if ( ! this.props.site.canUpdateFiles && this.props.site.options.file_mod_disabled ) {
			const reasons = getSiteFileModDisableReason( this.props.site, 'modifyFiles' );
			const html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ this.props.translate( '%(pluginName)s cannot be removed:', {
							args: { pluginName: this.props.plugin.name },
						} ) }
					</p>
				);
				const list = reasons.map( ( reason, i ) => (
					<li key={ 'reason-i' + i + '-' + this.props.site.ID }>{ reason }</li>
				) );
				html.push(
					/* eslint-disable wpcalypso/jsx-classname-namespace */
					<ul className="plugin-action__disabled-info-list" key="reason-shell-list">
						{ list }
					</ul>
				);
			} else {
				html.push(
					<p key="reason-shell">
						{ this.props.translate( '%(pluginName)s cannot be removed. %(reason)s', {
							args: { pluginName: this.props.plugin.name, reason: reasons[ 0 ] },
						} ) }
					</p>
				);
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={ this.handleHowDoIFixThisButtonClick }
					href="https://jetpack.me/support/site-management/#file-update-disabled"
				>
					{ this.props.translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	};

	handleHowDoIFixThisButtonClick = () => {
		gaRecordEvent( 'Plugins', 'Clicked How do I fix disabled plugin removal.' );
	};

	renderButton = () => {
		const disabledInfo = this.getDisabledInfo();
		const disabled = !! disabledInfo || this.props.disabled;
		let label = disabled
			? this.props.translate( 'Removal Disabled', {
					context:
						'this goes next to an icon that displays if site is in a state where it can\'t modify has "Removal Disabled" ',
			  } )
			: this.props.translate( 'Remove', {
					context: 'Verb. Presented to user as a label for a button.',
			  } );
		if ( this.props.inProgress ) {
			label = this.props.translate( 'Removing…' );
			if ( ! this.props.isJetpackCloud ) {
				return (
					<div className="plugin-action">
						<span className="plugin-remove-button__remove">{ label }</span>
					</div>
				);
			}
		}

		const handleClick = disabled ? null : this.removeAction;

		if ( this.props.menuItem ) {
			return (
				<PopoverMenuItem
					onClick={ handleClick }
					icon="trash"
					disabled={ this.props.inProgress }
					className={ clsx( 'plugin-remove-button__remove-button', this.props.classNames ) }
				>
					{ label }
				</PopoverMenuItem>
			);
		}

		return (
			<PluginAction
				htmlFor={ 'remove-plugin-' + this.props.site.ID }
				action={ this.removeAction }
				disabled={ disabled }
				disabledInfo={ disabledInfo }
				className="plugin-remove-button__remove-link"
			>
				<Button onClick={ handleClick } className="plugin-remove-button__remove-button">
					<Icon icon={ trash } className="plugin-remove-button__remove-icon" />
					{ label }
				</Button>
			</PluginAction>
		);
	};

	render() {
		if ( ! this.props.site.jetpack ) {
			return null;
		}

		if ( this.props.isMarketplaceProduct && this.props.productPurchase ) {
			// Purchased Marketplace products are auto-managed.
			return null;
		}

		if ( this.props.plugin.slug === 'jetpack' ) {
			return null;
		}

		return this.renderButton();
	}
}

export default connect(
	( state, { site, plugin } ) => ( {
		inProgress: isPluginActionInProgress( state, site.ID, plugin.id, REMOVE_PLUGIN ),
	} ),
	{ removePlugin, removePluginStatuses }
)( withShowPluginActionDialog( localize( PluginRemoveButton ) ) );
