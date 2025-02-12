import { ExternalLink } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { DISABLE_AUTOUPDATE_PLUGIN, ENABLE_AUTOUPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getSiteFileModDisableReason, isMainNetworkSite } from 'calypso/lib/site/utils';
import PluginAction from 'calypso/my-sites/plugins/plugin-action/plugin-action';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { togglePluginAutoUpdate } from 'calypso/state/plugins/installed/actions';
import { isPluginActionInProgress } from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { AUTOMOMANAGED_PLUGINS, PREINSTALLED_PLUGINS } from '../constants';

const autoUpdateActions = [ ENABLE_AUTOUPDATE_PLUGIN, DISABLE_AUTOUPDATE_PLUGIN ];

export class PluginAutoUpdateToggle extends Component {
	toggleAutoUpdates = () => {
		const {
			disabled,
			site,
			plugin,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;

		if ( disabled ) {
			return;
		}

		this.props.togglePluginAutoUpdate( site.ID, plugin );
		this.props.removePluginStatuses( 'completed', 'error', 'up-to-date' );

		if ( plugin.autoupdate ) {
			recordGAEvent(
				'Plugins',
				'Clicked Toggle Disable Autoupdates Plugin',
				'Plugin Name',
				plugin.slug
			);
			recordEvent( 'calypso_plugin_autoupdate_toggle_click', {
				site: site.ID,
				plugin: plugin.slug,
				state: 'inactive',
			} );
		} else {
			recordGAEvent(
				'Plugins',
				'Clicked Toggle Enable Autoupdates Plugin',
				'Plugin Name',
				plugin.slug
			);
			recordEvent( 'calypso_plugin_autoupdate_toggle_click', {
				site: site.ID,
				plugin: plugin.slug,
				state: 'active',
			} );
		}
	};

	isAutoManaged = () => {
		const isPurchasedMarketplaceProduct =
			this.props.isMarketplaceProduct && this.props.productPurchase;
		const isPreinstalledPlugin = PREINSTALLED_PLUGINS.includes( this.props.plugin.slug );
		const isAutomanagedPlugin = AUTOMOMANAGED_PLUGINS.includes( this.props.plugin.slug );

		// Auto-managed are only applicable to sites that are part of an automated transfer.
		return (
			this.props.siteAutomatedTransfer &&
			( isPurchasedMarketplaceProduct || isPreinstalledPlugin || isAutomanagedPlugin )
		);
	};

	getDisabledInfo() {
		const { site, wporg, translate } = this.props;

		if ( this.isAutoManaged() ) {
			return translate(
				'This plugin is auto managed and therefore will auto update to the latest stable version.'
			);
		}

		if ( ! site || ! site.options ) {
			// we don't have enough info
			return null;
		}

		if ( ! wporg ) {
			return translate(
				"This plugin is not in the WordPress.org plugin repository, so we can't autoupdate it."
			);
		}

		if ( site.options.is_multi_network ) {
			return translate(
				'%(site)s is part of a multi-network installation, which is not currently supported.',
				{
					args: { site: site.title },
				}
			);
		}

		if ( ! isMainNetworkSite( site ) ) {
			return translate(
				'Only the main site on a multi-site installation can enable autoupdates for plugins.',
				{
					args: { site: site.title },
				}
			);
		}

		if ( ! site.canAutoupdateFiles && site.options.file_mod_disabled ) {
			const reasons = getSiteFileModDisableReason( site, 'autoupdateFiles' );
			const html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ translate( 'Autoupdates are not available for %(site)s:', {
							args: { site: site.title },
						} ) }
					</p>
				);
				const list = reasons.map( ( reason, i ) => (
					<li key={ 'reason-i' + i + '-' + site.ID }>{ reason }</li>
				) );
				html.push(
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					<ul className="plugin-action__disabled-info-list" key="reason-shell-list">
						{ list }
					</ul>
				);
			} else {
				html.push(
					<p key="reason-shell">
						{ translate( 'Autoupdates are not available for %(site)s. %(reason)s', {
							args: { site: site.title, reason: reasons[ 0 ] },
						} ) }
					</p>
				);
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={ this.recordEvent }
					href="https://jetpack.me/support/site-management/#file-update-disabled"
				>
					{ translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	}

	render() {
		const { inProgress, site, plugin, label, disabled, translate, hideLabel, toggleExtraContent } =
			this.props;
		if ( ! site.jetpack || ! plugin ) {
			return null;
		}

		const getDisabledInfo = this.getDisabledInfo();
		const defaultLabel = translate( 'Autoupdates', {
			comment:
				'this goes next to an icon that displays if the plugin has "autoupdates", both enabled and disabled',
		} );

		return (
			<PluginAction
				disabled={ this.isAutoManaged() ? true : disabled }
				label={ label || defaultLabel }
				className="plugin-autoupdate-toggle"
				status={ this.isAutoManaged() ? true : plugin.autoupdate }
				action={ this.toggleAutoUpdates }
				inProgress={ inProgress }
				disabledInfo={ getDisabledInfo }
				htmlFor={ 'autoupdates-' + plugin.slug + '-' + site.ID }
				hideLabel={ hideLabel }
				toggleExtraContent={ toggleExtraContent }
			/>
		);
	}
}

PluginAutoUpdateToggle.propTypes = {
	site: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	wporg: PropTypes.bool,
	disabled: PropTypes.bool,
	isMarketplaceProduct: PropTypes.bool,
};

PluginAutoUpdateToggle.defaultProps = {
	disabled: false,
	isMarketplaceProduct: false,
};

export default connect(
	( state, { site, plugin } ) => ( {
		inProgress: plugin && isPluginActionInProgress( state, site.ID, plugin.id, autoUpdateActions ),
		siteAutomatedTransfer: isSiteAutomatedTransfer( state, site.ID ),
	} ),
	{
		recordGoogleEvent,
		recordTracksEvent,
		removePluginStatuses,
		togglePluginAutoUpdate,
	}
)( localize( PluginAutoUpdateToggle ) );
