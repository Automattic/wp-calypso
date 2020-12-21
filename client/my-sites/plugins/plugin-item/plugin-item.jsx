/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { uniqBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { CompactCard } from '@automattic/components';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import Count from 'calypso/components/count';
import Notice from 'calypso/components/notice';
import { ACTIVATE_PLUGIN, REMOVE_PLUGIN, UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class PluginItem extends Component {
	static propTypes = {
		plugin: PropTypes.object,
		sites: PropTypes.array,
		isSelected: PropTypes.bool,
		isSelectable: PropTypes.bool,
		onClick: PropTypes.func,
		pluginLink: PropTypes.string,
		allowedActions: PropTypes.shape( {
			activation: PropTypes.bool,
			autoupdate: PropTypes.bool,
		} ),
		isAutoManaged: PropTypes.bool,
		progress: PropTypes.array,
	};

	static defaultProps = {
		allowedActions: {
			activation: true,
			autoupdate: true,
		},
		progress: [],
		isAutoManaged: false,
	};

	ago( date ) {
		return this.props.moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	}

	doing() {
		const { translate, progress } = this.props;
		const log = progress[ 0 ];
		const uniqLogs = uniqBy( progress, function ( uniqLog ) {
			return uniqLog.siteId;
		} );
		const translationArgs = {
			args: { count: uniqLogs.length },
			count: uniqLogs.length,
		};

		let message;
		switch ( log && log.action ) {
			case UPDATE_PLUGIN:
				message = this.props.selectedSite
					? translate( 'Updating', { context: 'plugin' } )
					: translate(
							'Updating on %(count)s site',
							'Updating on %(count)s sites',
							translationArgs
					  );
				break;

			case ACTIVATE_PLUGIN:
				message = this.props.selectedSite
					? translate( 'Activating', { context: 'plugin' } )
					: translate(
							'Activating on %(count)s site',
							'Activating on %(count)s sites',
							translationArgs
					  );
				break;

			case 'DEACTIVATE_PLUGIN':
				message = this.props.selectedSite
					? translate( 'Deactivating', { context: 'plugin' } )
					: translate(
							'Deactivating on %(count)s site',
							'Deactivating on %(count)s sites',
							translationArgs
					  );
				break;

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				message = this.props.selectedSite
					? translate( 'Enabling autoupdates' )
					: translate(
							'Enabling autoupdates on %(count)s site',
							'Enabling autoupdates on %(count)s sites',
							translationArgs
					  );
				break;

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				message = this.props.selectedSite
					? translate( 'Disabling autoupdates' )
					: translate(
							'Disabling autoupdates on %(count)s site',
							'Disabling autoupdates on %(count)s sites',
							translationArgs
					  );

				break;
			case REMOVE_PLUGIN:
				message = this.props.selectedSite
					? translate( 'Removing' )
					: translate(
							'Removing from %(count)s site',
							'Removing from %(count)s sites',
							translationArgs
					  );
		}
		return message;
	}

	renderUpdateFlag() {
		const { pluginsOnSites, sites, translate } = this.props;
		const recentlyUpdated = sites.some( function ( site ) {
			const sitePlugin = pluginsOnSites?.sites[ site.ID ];
			return sitePlugin?.update?.recentlyUpdated;
		} );

		if ( recentlyUpdated ) {
			return (
				<Notice
					isCompact
					icon="checkmark"
					status="is-success"
					inline={ true }
					text={ translate( 'Updated' ) }
				/>
			);
		}

		const updated_versions = this.props.plugin.sites
			.map( ( site ) => {
				const sitePlugin = pluginsOnSites?.sites[ site.ID ];
				return sitePlugin?.update?.new_version;
			} )
			.filter( ( version ) => version );

		return (
			<Notice
				isCompact
				icon="sync"
				inline={ true }
				text={ translate( 'Version %(newPluginVersion)s is available', {
					args: { newPluginVersion: updated_versions[ 0 ] },
				} ) }
			/>
		);
	}

	hasUpdate( pluginData ) {
		const { pluginsOnSites } = this.props;

		return pluginData.sites.some( ( site ) => {
			const sitePlugin = pluginsOnSites?.sites[ site.ID ];
			return sitePlugin?.update && site.canUpdateFiles;
		} );
	}

	pluginMeta( pluginData ) {
		const { progress, translate } = this.props;
		if ( progress.length ) {
			const message = this.doing();
			if ( message ) {
				return <Notice isCompact status="is-info" text={ message } inline={ true } />;
			}
		}
		if ( this.props.isAutoManaged ) {
			return (
				<div className="plugin-item__last-updated">
					{ translate( 'Auto-managed on this site' ) }
				</div>
			);
		}

		if ( this.hasUpdate( pluginData ) ) {
			return this.renderUpdateFlag();
		}

		if ( pluginData.last_updated ) {
			return (
				<div className="plugin-item__last-updated">
					{ translate( 'Last updated %(ago)s', {
						args: { ago: this.ago( pluginData.last_updated ) },
					} ) }
				</div>
			);
		}

		return null;
	}

	renderActions() {
		const {
			activation: canToggleActivation,
			autoupdate: canToggleAutoupdate,
		} = this.props.allowedActions;

		return (
			<div className="plugin-item__actions">
				{ canToggleActivation && (
					<PluginActivateToggle
						isMock={ this.props.isMock }
						plugin={ this.props.plugin }
						disabled={ this.props.isSelectable }
						site={ this.props.selectedSite }
					/>
				) }
				{ canToggleAutoupdate && (
					<PluginAutoupdateToggle
						isMock={ this.props.isMock }
						plugin={ this.props.plugin }
						disabled={ this.props.isSelectable }
						site={ this.props.selectedSite }
						wporg={ !! this.props.plugin.wporg }
					/>
				) }
			</div>
		);
	}

	renderSiteCount() {
		const { sites, translate } = this.props;
		return (
			<div className="plugin-item__count">
				{ translate( 'Sites {{count/}}', {
					components: {
						count: <Count count={ sites.length } />,
					},
				} ) }
			</div>
		);
	}

	renderPlaceholder() {
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<CompactCard className="plugin-item is-placeholder">
				<div className="plugin-item__link">
					<PluginIcon isPlaceholder />
					<div className="plugin-item__info">
						<div className="plugin-item__title is-placeholder" />
					</div>
				</div>
			</CompactCard>
		);
	}

	onItemClick = ( event ) => {
		if ( this.props.isSelectable ) {
			event.preventDefault();
			this.props.onClick( this );
		}
	};

	render() {
		const plugin = this.props.plugin;

		if ( ! plugin ) {
			return this.renderPlaceholder();
		}

		const pluginTitle = <div className="plugin-item__title">{ plugin.name }</div>;

		let pluginActions = null;
		if ( ! this.props.selectedSite ) {
			pluginActions = this.renderSiteCount();
		} else {
			pluginActions = this.renderActions();
		}

		const pluginItemClasses = classNames( 'plugin-item', 'plugin-item-' + plugin.slug );

		return (
			<CompactCard className={ pluginItemClasses }>
				{ ! this.props.isSelectable ? null : (
					<FormInputCheckbox
						className="plugin-item__checkbox"
						id={ plugin.slug }
						onClick={ this.props.onClick }
						checked={ this.props.isSelected }
						readOnly={ true }
					/>
				) }
				<a
					className="plugin-item__link"
					href={ this.props.pluginLink }
					onClick={ this.onItemClick }
				>
					<PluginIcon image={ plugin.icon } />
					<div className="plugin-item__info">
						{ pluginTitle }
						{ this.pluginMeta( plugin ) }
					</div>
				</a>
				{ pluginActions }
			</CompactCard>
		);
	}
}

export default connect( ( state, { plugin, sites } ) => {
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	const siteIds = sites.map( ( site ) => site.ID );

	return {
		pluginsOnSites: getPluginOnSites( state, siteIds, plugin.slug ),
	};
} )( localize( withLocalizedMoment( PluginItem ) ) );
