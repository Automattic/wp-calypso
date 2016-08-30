/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import ProgressIndicator from 'components/progress-indicator';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import analytics from 'lib/analytics';
import { userCan } from 'lib/site/utils';

export default React.createClass( {
	displayName: 'SiteIndicator',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		onSelect: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onSelect: noop
		};
	},

	getInitialState() {
		return { expand: false };
	},

	hasUpdate() {
		return this.props.site.update && ! this.hasError() && this.props.site.update.total > 0;
	},

	hasError() {
		var site = this.props.site;
		if ( site.unreachable ) {
			return true;
		}
		return false;
	},

	hasWarning() {
		var site = this.props.site;

		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			if ( site.callingHome ) {
				return false;
			} else if ( typeof site.unreachable === 'undefined' ) {
				if ( 'function' === typeof site.callHome ) {
					site.callHome();
				}
				return false;
			}
			return true;
		}
		return false;
	},

	showIndicator() {
		// Until WP.com sites have indicators (upgrades expiring, etc) we only show them for Jetpack sites
		return userCan( 'manage_options', this.props.site ) &&
			this.props.site.jetpack &&
			( this.hasUpdate() || this.hasError() || this.hasWarning() || this.state.updateError );
	},

	toggleExpand() {
		this.setState( {
			updateError: false,
			updateSucceed: false,
			expand: ! this.state.expand
		} );

		analytics.ga.recordEvent( 'Site-Indicator', 'Clicked to ' + ( ! this.state.expand ? 'Expand' : 'Collapse' ) + ' the Site Indicator' );
	},

	updatesAvailable() {
		if ( config.isEnabled( 'jetpack_core_inline_update' ) && this.props.site.update.wordpress && this.props.site.update.wp_update_version ) {
			return (
				<span>
					{
						this.translate( 'A newer version of WordPress is available. {{link}}Update to %(version)s{{/link}}', {
							components: {
								link: <button className="button is-link" onClick={ this.handleUpdate } />
							},
							args: {
								version: this.props.site.update.wp_update_version
							}
						} )
					}
				</span>
			);
		}

		if ( this.props.site.update.plugins === this.props.site.update.total && this.props.site.canUpdateFiles ) {
			return (
				<span>
					<a
						onClick={ this.handlePluginsUpdate }
						href={ '/plugins/updates/' + this.props.site.slug } >
						{ this.translate( 'There is a plugin update available.', 'There are plugin updates available.', { count: this.props.site.update.total } ) }
					</a>
				</span>
			);
		}

		const recordEvent = analytics.ga.recordEvent.bind(
				analytics,
				'Site-Indicator',
				'Clicked updates available link to wp-admin updates',
				'Total Updates',
				this.props.site.update && this.props.site.update.total
			);

		return (
			<span>
				<a
					onClick={ recordEvent }
					href={ this.props.site.options.admin_url + 'update-core.php' } >
					{ this.translate( 'There is an update available.', 'There are updates available.', { count: this.props.site.update.total } ) }
				</a>
			</span>
		);
	},

	onUpdateError() {
		this.setState( {
			expand: true,
			updating: false,
			updateError: true
		} );
	},

	onUpdateSuccess() {
		this.setState( {
			updating: false,
			updateSucceed: true
		} );
		this.timer = setTimeout( function() {
			this.setState( { updateSucceed: false } );
			this.timer = null;
		}.bind( this ), 15000 );
	},

	handlePluginsUpdate( event ) {
		window.scrollTo( 0, 0 );
		this.props.onSelect( event );
		analytics.ga.recordEvent( 'Site-Indicator', 'Clicked updates available link to plugins updates', 'Total Updates', this.props.site.update && this.props.site.update.total );
	},

	handleUpdate() {
		this.setState( {
			updating: true,
			expand: false
		} );
		this.timer != null ? clearTimeout( this.timer ) : null;
		this.props.site.updateWordPress( this.onUpdateError, this.onUpdateSuccess );

		analytics.ga.recordEvent( 'site-indicator', 'Triggered Update WordPress Core Version From Calypso' );
	},

	unsupportedJetpackVersion() {
		return (
			<span>
				{ this.translate( 'Jetpack %(version)s is required', { args: { version: config( 'jetpack_min_version' ) } } ) }.
				<a
					onClick={ this.makeAnalyticsRecordEventHandler( 'Clicked Update Jetpack Now Link' ) }
					href={ this.props.site.options.admin_url + 'plugins.php?plugin_status=upgrade' }
					>{ this.translate( 'Update now' ) }
				</a>.
			</span> );
	},

	makeAnalyticsRecordEventHandler( action ) {
		return function() {
			analytics.ga.recordEvent( 'Site-Indicator', action );
		};
	},

	errorAccessing() {
		let accessFailedMessage;

		// Don't show the button if the site is not defined.
		if ( this.props.site ) {
			accessFailedMessage = <span>{ this.translate( 'This site cannot be accessed.' ) } <DisconnectJetpackButton site={ this.props.site } text={ this.translate( 'Disconnect Site' ) } redirect="/sites" /></span>;
		} else {
			accessFailedMessage = <span>{ this.translate( 'This site cannot be accessed.' ) }</span>;
		}
		return accessFailedMessage;
	},

	errorUpdating() {
		return ( <span>
			{ this.translate( 'There was a problem updating. {{link}}Update on site{{/link}}.',
				{
					components: {
						link: <a href={ this.props.site.options.admin_url + 'update-core.php' } onClick={ this.makeAnalyticsRecordEventHandler( 'Clicked Update On Site Link' ) } />
					}
				}
			) }
		</span> );
	},

	getText() {
		if ( this.state.updateError ) {
			return this.errorUpdating();
		}

		if ( this.hasUpdate() ) {
			return this.updatesAvailable();
		}

		if ( this.hasError() ) {
			return this.errorAccessing();
		}

		if ( this.hasWarning() ) {
			return this.unsupportedJetpackVersion();
		}

		return null;
	},

	getIcon() {
		if ( this.hasUpdate() ) {
			return 'sync';
		}

		if ( this.hasWarning() ) {
			return 'notice';
		}

		if ( this.hasError() ) {
			return 'notice';
		}
	},

	render() {
		var indicatorClass, textClass, progressStatus;

		if ( ! this.showIndicator() ) {
			return null;
		}

		if ( this.state.updating || this.state.updateSucceed ) {
			if ( this.state.updating ) {
				progressStatus = 'processing';
			}
			if ( this.state.updateSucceed ) {
				progressStatus = 'success';
			}
			return (
				<div className="site-indicator">
					<ProgressIndicator key="update-progress" status={ progressStatus } className="site-indicator__progress-indicator" />
				</div>
			);
		}

		indicatorClass = classNames( {
			'is-expanded': this.state.expand,
			'is-update': this.hasUpdate(),
			'is-warning': this.hasWarning(),
			'is-error': this.hasError(),
			'is-action': true,
			'site-indicator': true
		} );

		textClass = classNames( {
			'is-updating': this.state.updating,
			'is-updated': this.state.updateSucceed,
			'site-indicator__action': true
		} );

		return (
			<div className={ indicatorClass }>
				{ ! this.state.expand &&
					<button className="site-indicator__button" onClick={ this.toggleExpand }>
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon={ this.getIcon() } size={ 16 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
					</button>
				}
				{ this.state.expand
					? <div className="site-indicator__message">
						<div className={ textClass }>
							{ this.getText() }
						</div>
						<button className="site-indicator__button" onClick={ this.toggleExpand }>
							<Gridicon icon="cross" size={ 18 } />
						</button>
					</div>
					: null }
			</div>
		);
	}
} );
