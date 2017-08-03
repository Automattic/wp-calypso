/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import { localize, moment } from 'i18n-calypso';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Card from 'components/card';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import PluginsActions from 'lib/plugins/actions';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import Count from 'components/count';
import Notice from 'components/notice';
import PluginNotices from 'lib/plugins/notices';

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

class PluginItem extends Component {

	state = {
		clicked: false
	};

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
		errors: PropTypes.array,
		notices: PropTypes.shape( {
			completed: PropTypes.array,
			errors: PropTypes.array,
			inProgress: PropTypes.array,
		} ),
		hasAllNoManageSites: PropTypes.bool,
		hasUpdate: PropTypes.func,
	};

	static defaultProps = {
		allowedActions: {
			activation: true,
			autoupdate: true,
		},
		progress: [],
		isAutoManaged: false,
		hasUpdate: () => false,
	};

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
	}

	ago( date ) {
		return moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	}

	doing() {
		const { translate, progress } = this.props;
		const log = progress[ 0 ];
		const uniqLogs = uniqBy( progress, function( uniqLog ) {
			return uniqLog.site.ID;
		} );
		const translationArgs = {
			args: { count: uniqLogs.length },
			count: uniqLogs.length
		};

		let message;
		switch ( log && log.action ) {
			case 'UPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Updating', { context: 'plugin' } )
					: translate( 'Updating on %(count)s site', 'Updating on %(count)s sites', translationArgs ) );
				break;

			case 'ACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Activating', { context: 'plugin' } )
					: translate( 'Activating on %(count)s site', 'Activating on %(count)s sites', translationArgs ) );
				break;

			case 'DEACTIVATE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Deactivating', { context: 'plugin' } )
					: translate( 'Deactivating on %(count)s site', 'Deactivating on %(count)s sites', translationArgs ) );
				break;

			case 'ENABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Enabling autoupdates' )
					: translate( 'Enabling autoupdates on %(count)s site', 'Enabling autoupdates on %(count)s sites', translationArgs ) );
				break;

			case 'DISABLE_AUTOUPDATE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Disabling autoupdates' )
					: translate( 'Disabling autoupdates on %(count)s site', 'Disabling autoupdates on %(count)s sites', translationArgs ) );

				break;
			case 'REMOVE_PLUGIN':
				message = ( this.props.selectedSite
					? translate( 'Removing' )
					: translate( 'Removing from %(count)s site', 'Removing from %(count)s sites', translationArgs ) );
		}
		return message;
	}

	renderUpdateFlag() {
		const { sites, translate } = this.props;
		const recentlyUpdated = sites.some( function( site ) {
			return site.plugin &&
				site.plugin.update &&
				site.plugin.update.recentlyUpdated;
		} );

		if ( recentlyUpdated ) {
			return (
				<Notice isCompact
					icon="checkmark"
					status="is-success"
					inline={ true }
					text={ translate( 'Updated' ) } />
			);
		}

		const updated_versions = this.props.plugin.sites.map( site => {
			if ( site.plugin.update && site.plugin.update.new_version ) {
				return site.plugin.update.new_version;
			}
			return false;
		} ).filter( version => version );

		return (
			<Notice isCompact
				icon="sync"
				status="is-warning"
				inline={ true }
				text={ translate(
							'Version %(newPluginVersion)s is available',
							{ args: { newPluginVersion: updated_versions[ 0 ] } }
						) } />

		);
	}

	pluginMeta( pluginData ) {
		const { progress, translate } = this.props;
		if ( progress.length ) {
			const message = this.doing();
			if ( message ) {
				return (
					<Notice isCompact status="is-info" text={ message } inline={ true } />
				);
			}
		}
		if ( this.props.isAutoManaged ) {
			return (
				<div className="plugin-item__last_updated">
					{ translate( '%(pluginName)s is automatically managed on this site', { args: { pluginName: pluginData.name } } ) }
				</div>
			);
		}

		if ( this.props.hasUpdate( pluginData ) ) {
			return this.renderUpdateFlag();
		}

		if ( pluginData.last_updated ) {
			return (
				<div className="plugin-item__last_updated">
					{ translate( 'Last updated %(ago)s', { args: { ago: this.ago( pluginData.last_updated ) } } ) }
				</div>
			);
		}

		return null;
	}

	clickNoManageItem = () => {
		this.setState( { clicked: true } );
	}

	getNoManageWarning() {
		return <Notice text={ this.props.translate( 'Jetpack Manage is disabled for all the sites where this plugin is installed' ) }
			status="is-error"
			showDismiss={ false } />;
	}

	renderActions() {
		const {
			activation: canToggleActivation,
			autoupdate: canToggleAutoupdate,
		} = this.props.allowedActions;

		return (
			<div className="plugin-item__actions">
				{ canToggleActivation && <PluginActivateToggle
						isMock={ this.props.isMock }
						plugin={ this.props.plugin }
						disabled={ this.props.isSelectable }
						site={ this.props.selectedSite }
						notices={ this.props.notices } /> }
				{ canToggleAutoupdate && <PluginAutoupdateToggle
						isMock={ this.props.isMock }
						plugin={ this.props.plugin }
						disabled={ this.props.isSelectable }
						site={ this.props.selectedSite }
						notices={ this.props.notices }
						wporg={ !! this.props.plugin.wporg } /> }
			</div>
		);
	}

	renderSiteCount() {
		const { sites, translate } = this.props;
		return (
			<div className="plugin-item__count">{ translate( 'Sites {{count/}}',
				{
					components: {
						count: <Count count={ sites.length } />
					}
				} )
			}</div>
		);
	}

	renderPlaceholder() {
		return (
			<CompactCard className="plugin-item is-placeholder ">
				<PluginIcon isPlaceholder={ true } />
				<div className="plugin-item__title is-placeholder"></div>
				<div className="plugin-item__meta is-placeholder"></div>
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

		if ( this.props.hasUpdate( plugin ) ) {
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
							<PluginIcon image={ plugin.icon } />
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

		const CardType = this.props.isCompact ? CompactCard : Card;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<CardType className="plugin-item">
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
						<PluginIcon image={ plugin.icon } />
						{ pluginTitle }
						{ this.pluginMeta( plugin ) }
					</a>
					{ this.props.selectedSite ? this.renderActions() : this.renderSiteCount() }
				</CardType>
				{ errorNotices }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( PluginItem );
