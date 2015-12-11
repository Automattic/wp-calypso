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
	Notice = require( 'notices/notice' ),
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
					? i18n.translate( 'updating', { context: 'plugin' } )
					: i18n.translate( 'updating on %(count)s site', 'updating on %(count)s sites', translationArgs ) );
				break;

			case 'ACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'activating', { context: 'plugin' } )
					: i18n.translate( 'activating on %(count)s site', 'activating on %(count)s sites', translationArgs ) );
				break;

			case 'DEACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'deactivating', { context: 'plugin' } )
					: i18n.translate( 'deactivating on %(count)s site', 'deactivating on %(count)s sites', translationArgs ) );
				break;

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'enabling autoupdates' )
					: i18n.translate( 'enabling autoupdates on %(count)s site', 'enabling autoupdates on %(count)s sites', translationArgs ) );
				break;

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? i18n.translate( 'disabling autoupdates' )
					: i18n.translate( 'disabling autoupdates on %(count)s site', 'disabling autoupdates on %(count)s sites', translationArgs ) );
				break;
		}
		return message;
	},

	pluginMeta: function( pluginData ) {
		var metaText,
			meta;
		if ( this.props.progress.length ) {
			meta = (
				<div className="plugin-item__meta doing">
						{ this.doing() }
				</div>
				);
		} else if ( this.hasUpdate() ) {
			meta = (
				<div className="plugin-item__meta has-update">
					<span className="noticon noticon-refresh"></span>
					<span className="plugin-item__meta-text ">
						{ this.translate( 'A newer version is available' ) }
					</span>
				</div>
				);
		} else {
			if ( pluginData.wpcom ) {
				metaText = this.translate( 'Updated Automatically' );
			} else if ( pluginData.last_updated ) {
				metaText = this.translate( 'Last updated %(ago)s', {
					args: { ago: this.ago( pluginData.last_updated ) }
				} );
			} else {
				metaText = '';
			}

			meta = <div className="plugin-item__meta">{ metaText }</div>;
		}

		return meta;
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
			errorCounter = 0,
			pluginItemClasses = classNames( 'plugin-item', { disabled: this.props.hasAllNoManageSites } );

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
				errorNotices.push(
					<Notice
						type='message'
						status='is-error'
						text={ PluginNotices.getMessage( [ error ], PluginNotices.errorMessage.bind( PluginNotices ) ) }
						isCompact={ true }
						button={ PluginNotices.getErrorButton( error ) }
						href={ PluginNotices.getErrorHref( error ) }
						raw={ { onRemoveCallback: PluginsActions.removePluginsNotices.bind( this, [ error ] ) } }
						inline={ true }
						key={ 'notice-' + errorCounter } />
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
					<div>
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
