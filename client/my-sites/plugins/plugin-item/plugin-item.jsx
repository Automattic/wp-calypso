/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	uniqBy = require( 'lodash/uniqBy' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	PluginIcon = require( 'my-sites/plugins/plugin-icon/plugin-icon' ),
	PluginsActions = require( 'lib/plugins/actions' ),
	PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' ),
	PluginAutoupdateToggle = require( 'my-sites/plugins/plugin-autoupdate-toggle' ),
	Count = require( 'components/count' ),
	Notice = require( 'components/notice' ),
	PluginNotices = require( 'lib/plugins/notices' ),
	analytics = require( 'lib/analytics' );

module.exports = React.createClass( {

	displayName: 'PluginItem',

	getInitialState: function() {
		return { clicked: false };
	},

	recordEvent: function( eventAction ) {
		analytics.ga.recordEvent( 'Plugins', eventAction, 'Plugin Name', this.props.plugin.slug );
	},

	ago: function( date ) {
		return i18n.moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	},

	hasUpdate: function() {
		return this.props.sites.some( function( site ) {
			return site.plugin && site.plugin.update && site.canUpdateFiles;
		} );
	},

	doing: function() {
		var progress = this.props.progress ? this.props.progress : [],
			log = progress[ 0 ],
			message,
			uniqLogs = uniqBy( progress, function( uniqLog ) {
				return uniqLog.site.ID;
			} ),
			translationArgs = {
				args: { count: uniqLogs.length },
				count: uniqLogs.length
			};

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

	renderUpdateFlag: function() {
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

	pluginMeta: function( pluginData ) {
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

	clickNoManageItem: function() {
		this.setState( { clicked: true } );
	},

	getNoManageWarning: function() {
		return <Notice text={ i18n.translate( 'Jetpack Manage is disabled for all the sites where this plugin is installed' ) }
			status="is-error"
			showDismiss={ false } />;
	},

	renderActions: function() {
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

	renderCount: function() {
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

	renderPlaceholder: function() {
		return (
			<CompactCard className="plugin-item is-placeholder ">
				<PluginIcon isPlaceholder={ true } />
				<div className="plugin-item__title is-placeholder"></div>
				<div className="plugin-item__meta is-placeholder"></div>
			</CompactCard>
		);
	},

	onItemClick: function( event ) {
		if ( this.props.isSelectable ) {
			event.preventDefault();
			this.props.onClick( this );
		}
	},

	render: function() {
		var pluginTitle,
			plugin = this.props.plugin,
			errors = this.props.errors ? this.props.errors : [],
			numberOfWarningIcons = 0,
			errorNotices = [],
			errorCounter = 0;

		if ( ! this.props.plugin ) {
			return this.renderPlaceholder();
		}

		errors.forEach( function( error ) {
			errorNotices.push(
				<Notice
					type="message"
					status="is-error"
					text={ PluginNotices.getMessage( [ error ], PluginNotices.errorMessage.bind( PluginNotices ) ) }
					button={ PluginNotices.getErrorButton( error ) }
					href={ PluginNotices.getErrorHref( error ) }
					raw={ { onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, [ error ] ) } }
					inline={ true }
					key={ 'notice-' + errorCounter } />
			);
			errorCounter++;
		}, this );

		if ( this.props.hasNoManageSite ) {
			numberOfWarningIcons++;
		}

		if ( this.hasUpdate() ) {
			numberOfWarningIcons++;
		}

		pluginTitle = (
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
						{ this.props.selectedSite ? null : this.renderCount() }
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
					{ this.props.selectedSite ? this.renderActions() : this.renderCount() }
				</CompactCard>
				{ errorNotices }
			</div>
		);
	}

} );
