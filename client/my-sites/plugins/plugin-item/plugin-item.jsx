/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import i18n from 'i18n-calypso';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import PluginsActions from 'lib/plugins/actions';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import Count from 'components/count';
import Notice from 'components/notice';
import PluginNotices from 'lib/plugins/notices';
import analytics from 'lib/analytics';

function checkPropsChange( nextProps, propArr ) {
	let i;

	for ( i = 0; i < propArr.length; i++ ) {
		const prop = propArr[ i ];

		if ( ! isEqual( nextProps[ prop ], this.props[ prop ] ) ) {
			return true;
		}
	}
	return false;
}

module.exports = React.createClass( {

	displayName: 'PluginItem',

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'plugin', 'sites', 'selectedSite', 'isMock', 'isSelectable', 'isSelected' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.hasAllNoManageSites !== nextProps.hasAllNoManageSites ) {
			return true;
		}

		if ( this.props.notices && PluginNotices.shouldComponentUpdateNotices( this.props.notices, nextProps.notices ) ) {
			return true;
		}

		if ( this.state.clicked !== nextState.clicked ) {
			return true;
		}
		return false;
	},

	getInitialState() {
		return { clicked: false };
	},

	recordEvent( eventAction ) {
		analytics.ga.recordEvent( 'Plugins', eventAction, 'Plugin Name', this.props.plugin.slug );
	},

	ago( date ) {
		return i18n.moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	},

	hasUpdate() {
		return this.props.sites.some( function( site ) {
			return site.plugin && site.plugin.update && site.canUpdateFiles;
		} );
	},

	doing() {
		const progress = this.props.progress ? this.props.progress : [],
			log = progress[ 0 ],
			uniqLogs = uniqBy( progress, function( uniqLog ) {
				return uniqLog.site.ID;
			} ),
			translationArgs = {
				args: { count: uniqLogs.length },
				count: uniqLogs.length
			};

		let message;
		switch ( log && log.action ) {
			case 'UPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Updating', { context: 'plugin' } )
					: i18n.translate( 'Updating on %(count)s site', 'Updating on %(count)s sites', translationArgs ) );
				break;

			case 'ACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Activating', { context: 'plugin' } )
					: i18n.translate( 'Activating on %(count)s site', 'Activating on %(count)s sites', translationArgs ) );
				break;

			case 'DEACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Deactivating', { context: 'plugin' } )
					: i18n.translate( 'Deactivating on %(count)s site', 'Deactivating on %(count)s sites', translationArgs ) );
				break;

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Enabling autoupdates' )
					: i18n.translate( 'Enabling autoupdates on %(count)s site', 'Enabling autoupdates on %(count)s sites', translationArgs ) );
				break;

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Disabling autoupdates' )
					: i18n.translate( 'Disabling autoupdates on %(count)s site', 'Disabling autoupdates on %(count)s sites', translationArgs ) );

				break;
			case 'REMOVE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Removing' )
					: i18n.translate( 'Removing from %(count)s site', 'Removing from %(count)s sites', translationArgs ) );
		}
		return message;
	},

	renderUpdateFlag() {
		const recentlyUpdated = this.props.sites.some( function( site ) {
			return site.plugin &&
				site.plugin.update &&
				site.plugin.update.recentlyUpdated
		} );

		if ( recentlyUpdated ) {
			return (
				<Notice isCompact
					icon="checkmark"
					status="is-success"
					inline={ true }
					text={ this.translate( 'Updated' ) } />
			);
		}
		return (
			<Notice isCompact
				icon="sync"
				status="is-warning"
				inline={ true }
				text={ this.translate( 'A newer version is available' ) } />
		);
	},

	pluginMeta( pluginData ) {
		if ( this.props.progress.length ) {
			return (
				<Notice isCompact status="is-info" text={ this.doing() } inline={ true }/>
			);
		}
		if ( this.hasUpdate() ) {
			return this.renderUpdateFlag();
		}

		if ( pluginData.last_updated ) {
			return (
				<div className="plugin-item__last_updated">
					{ this.translate( 'Last updated %(ago)s', { args: { ago: this.ago( pluginData.last_updated ) } } ) }
				</div>
			);
		}

		return null;
	},

	clickNoManageItem() {
		this.setState( { clicked: true } );
	},

	getNoManageWarning() {
		return <Notice text={ i18n.translate( 'Jetpack Manage is disabled for all the sites where this plugin is installed' ) }
			status="is-error"
			showDismiss={ false } />;
	},

	renderActions() {
		return (
			<div className="plugin-item__actions">
				<PluginActivateToggle
					isMock={ this.props.isMock }
					plugin={ this.props.plugin }
					disabled={ this.props.isSelectable }
					site={ this.props.selectedSite }
					notices={ this.props.notices } />
				<PluginAutoupdateToggle
					isMock={ this.props.isMock }
					plugin={ this.props.plugin }
					disabled={ this.props.isSelectable }
					site={ this.props.selectedSite }
					notices={ this.props.notices }
					wporg={ !! this.props.plugin.wporg } />
			</div>
		);
	},

	renderSiteCount() {
		return (
			<div className="plugin-item__count">{ this.translate( 'Sites {{count/}}',
				{
					components: {
						count: <Count count={ this.props.sites.length } />
					}
				} )
			}</div>
		);
	},

	renderPlaceholder() {
		return (
			<CompactCard className="plugin-item is-placeholder ">
				<PluginIcon isPlaceholder={ true } />
				<div className="plugin-item__title is-placeholder"></div>
				<div className="plugin-item__meta is-placeholder"></div>
			</CompactCard>
		);
	},

	onItemClick( event ) {
		if ( this.props.isSelectable ) {
			event.preventDefault();
			this.props.onClick( this );
		}
	},

	render() {
		const plugin = this.props.plugin;
		const errors = this.props.errors ? this.props.errors : [];

		if ( ! plugin ) {
			return this.renderPlaceholder();
		}

		let numberOfWarningIcons = 0;
		const errorNotices = errors.map( ( error, index ) => {
			const dismissErrorNotice = function() {
				PluginsActions.removePluginsNotices( [ error ] );
			};
			return (
				<Notice
					type="message"
					status="is-error"
					text={ PluginNotices.getMessage( [ error ], PluginNotices.errorMessage.bind( PluginNotices ) ) }
					button={ PluginNotices.getErrorButton( error ) }
					href={ PluginNotices.getErrorHref( error ) }
					inline={ true }
					onDismissClick={ dismissErrorNotice }
					key={ 'notice-' + index } />
			);
		} );

		if ( this.props.hasNoManageSite ) {
			numberOfWarningIcons++;
		}

		if ( this.hasUpdate() ) {
			numberOfWarningIcons++;
		}

		const pluginTitle = (
			<div className="plugin-item__title" data-warnings={ numberOfWarningIcons }>
				{ plugin.name }
			</div>
			);

		if ( this.props.hasAllNoManageSites ) {
			const pluginItemClasses = classNames( 'plugin-item', {
				disabled: this.props.hasAllNoManageSites,
			} );
			return (
				<div className="plugin-item__wrapper">
					<CompactCard className={ pluginItemClasses }
						onClick={ this.clickNoManageItem }>
						<span className="plugin-item__disabled">
							<PluginIcon image={ plugin.icon }/>
							{ pluginTitle }
							{ this.pluginMeta( plugin ) }
						</span>
						{ this.props.selectedSite ? null : this.renderSiteCount() }
					</CompactCard>
					<div>
					{ this.state.clicked ? this.getNoManageWarning() : null }
					</div>
				</div>
			);
		}
		return (
			<div>
				<CompactCard className="plugin-item">
					{ ! this.props.isSelectable
						? null
						: <input className="plugin-item__checkbox"
								id={ plugin.slug }
								type="checkbox"
								onClick={ this.props.onClick }
								checked={ this.props.isSelected }
								readOnly={ true } />
					}
					<a href={ this.props.pluginLink } onClick={ this.onItemClick } className="plugin-item__link">
						<PluginIcon image={ plugin.icon }/>
						{ pluginTitle }
						{ this.pluginMeta( plugin ) }
					</a>
					{ this.props.selectedSite ? this.renderActions() : this.renderSiteCount() }
				</CompactCard>
				{ errorNotices }
			</div>
		);
	}

} );
