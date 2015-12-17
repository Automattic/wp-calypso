/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' ),
	uniq = require( 'lodash/array/uniq' ),
	i18n = require( 'lib/mixins/i18n' );

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
	NoticeAction = require( 'components/notice/notice-action' ),
	PluginNotices = require( 'lib/plugins/notices' ),
	analytics = require( 'analytics' );

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
			uniqLogs = uniq( progress, function( uniqLog ) {
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
					: i18n.translate( 'Updating on %(count)s site', 'updating on %(count)s sites', translationArgs ) );
				break;

			case 'ACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Activating', { context: 'plugin' } )
					: i18n.translate( 'Activating on %(count)s site', 'activating on %(count)s sites', translationArgs ) );
				break;

			case 'DEACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Deactivating', { context: 'plugin' } )
					: i18n.translate( 'Deactivating on %(count)s site', 'deactivating on %(count)s sites', translationArgs ) );
				break;

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Enabling autoupdates' )
					: i18n.translate( 'Enabling autoupdates on %(count)s site', 'enabling autoupdates on %(count)s sites', translationArgs ) );
				break;

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'Disabling autoupdates' )
					: i18n.translate( 'Disabling autoupdates on %(count)s site', 'disabling autoupdates on %(count)s sites', translationArgs ) );

				break;
		}
		return message;
	},

	pluginMeta: function( pluginData ) {
		if ( this.props.progress.length ) {
			return (
				<Notice isCompact status="is-info" text={ this.doing() } inline={ true }/>
			);
		}
		if ( this.hasUpdate() ) {
			return (
				<Notice isCompact
					icon="sync"
					status="is-warning"
					inline={ true }
					text={ this.translate( 'A newer version is available' ) } />
			);
		}

		if ( pluginData.wpcom ) {
			return (
				<div className="plugin-item__last_updated">
					{ this.translate( 'Updated Automatically' ) }
				</div>
			);
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
					site={ this.props.selectedSite }
					notices={ this.props.notices } />
				<PluginAutoupdateToggle
					isMock={ this.props.isMock }
					plugin={ this.props.plugin }
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

	render: function() {
		var pluginTitle,
			plugin = this.props.plugin,
			errors = this.props.errors ? this.props.errors : [],
			numberOfWarningIcons = 0,
			errorNotices = [],
			errorCounter = 0;
		const pluginItemClasses = classNames( 'plugin-item', { disabled: this.props.hasAllNoManageSites } );

		if ( ! this.props.plugin ) {
			return this.renderPlaceholder();
		}

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

		if ( this.props.isSelectable ) {
			errors.forEach( function( error ) {
				let action = null;

				if ( PluginNotices.getErrorButton( error ) ) {
					action = (
						<NoticeAction href={ PluginNotices.getErrorHref( error ) }>
							{ PluginNotices.getErrorButton( error ) }
						</NoticeAction>
					);
				}

				errorNotices.push(
					<Notice
						type='message'
						status='is-error'
						showDismiss={ false }
						text={ PluginNotices.getMessage( [ error ], PluginNotices.errorMessage.bind( PluginNotices ) ) }
						inline={ true }
						key={ 'notice-' + errorCounter }
						>
						{ action }
					</Notice>
				);
				errorCounter++;
			}, this );
			return (
				<div>
					<CompactCard className={ pluginItemClasses }>
						<input
							className="plugin-item__checkbox"
							id={ plugin.slug }
							type="checkbox"
							onClick={ this.props.onClick }
							checked={ this.props.isSelected }
							readOnly={ true }
						/>
						<label className="plugin-item__label" htmlFor={ plugin.slug }>
							<span className="screen-reader-text">
								{ this.translate( 'Toggle selection of %(plugin)s', { args: { plugin: plugin.name } } ) }
							</span>
						</label>
						<div className="plugin-item__info">
							{ pluginTitle }
							{ this.pluginMeta( plugin ) }
						</div>
					</CompactCard>
					<div className="plugin-item__error-notices">
						{ errorNotices }
					</div>
				</div>
			);
		}
		if ( this.props.hasAllNoManageSites ) {
			return (
				<div className="plugin-item__wrapper">
					<CompactCard className={ pluginItemClasses }
						onClick={ this.clickNoManageItem }
					>
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
			<CompactCard className="plugin-item">
				<a href={ this.props.pluginLink } className="plugin-item__link">
					<PluginIcon image={ plugin.icon }/>
					{ pluginTitle }
					{ this.pluginMeta( plugin ) }
				</a>
				{ this.props.selectedSite ? this.renderActions() : this.renderCount() }
			</CompactCard>
		);
	}

} );
