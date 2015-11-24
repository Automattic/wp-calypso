/**
 * External dependencies
 */
var React = require( 'react' ),
	config = require( 'config' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var ProgressIndicator = require( 'components/progress-indicator' ),
	DisconnectJetpackButton = require( 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SiteIndicator',

	getInitialState: function() {
		return { expand: false };
	},

	hasUpdate: function() {
		return this.props.site.update && ! this.hasError() && this.props.site.update.total > 0;
	},

	hasError: function() {
		var site = this.props.site;
		if ( site.unreachable ) {
			return true;
		}
		if ( site.hasMinimumJetpackVersion && site.update === 'error' ) {
			return true;
		}
		return false;
	},

	hasWarning: function() {
		var site = this.props.site;

		if ( site.jetpack && ! site.hasMinimumJetpackVersion ) {
			if ( site.callingHome ) {
				return false;
			} else if ( typeof site.unreachable === 'undefined' ) {
				site.callHome();
				return false;
			}
			return true;
		}
		return false;
	},

	showIndicator: function() {
		// Until WP.com sites have indicators (upgrades expiring, etc) we only show them for Jetpack sites
		return this.props.site.user_can_manage && this.props.site.jetpack && ( this.hasUpdate() || this.hasError() || this.hasWarning() || this.state.updateError );
	},

	toggleExpand: function() {
		this.setState( {
			updateError: false,
			updateSucceed: false,
			expand: ! this.state.expand
		} );

		analytics.ga.recordEvent( 'Site-Indicator', 'Clicked to ' + ( ! this.state.expand ? 'Expand' : 'Collapse' ) + ' the Site Indicator' );
	},

	updatesAvailable: function() {
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
		return (
			<span>
				<a
					onClick={ analytics.ga.recordEvent.bind( analytics, 'Site-Indicator', 'Clicked updates available link to wp-admin updates', 'Total Updates', this.props.site.update && this.props.site.update.total ) }
					href={ this.props.site.options.admin_url + 'update-core.php' } >
					{ this.translate( 'There is an update available.', 'There are updates available.', { count: this.props.site.update.total } ) }
				</a>
			</span>
		);
	},

	onUpdateError: function() {
		this.setState( {
			expand: true,
			updating: false,
			updateError: true
		} );
	},

	onUpdateSuccess: function() {
		this.setState( {
			updating: false,
			updateSucceed: true
		} );
		this.timer = setTimeout( function() {
			this.setState( { updateSucceed: false } );
			this.timer = null;
		}.bind( this ), 15000 );
	},

	handlePluginsUpdate: function() {
		window.scrollTo( 0, 0 );
		analytics.ga.recordEvent( 'Site-Indicator', 'Clicked updates available link to plugins updates', 'Total Updates', this.props.site.update && this.props.site.update.total );
	},

	handleUpdate: function() {
		this.setState( {
			updating: true,
			expand: false
		} );
		this.timer != null ? clearTimeout( this.timer ) : null;
		this.props.site.updateWordPress( this.onUpdateError, this.onUpdateSuccess );

		analytics.ga.recordEvent( 'site-indicator', 'Triggered Update WordPress Core Version From Calypso' );
	},

	unsupportedJetpackVersion: function() {
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

	makeAnalyticsRecordEventHandler: function( action ) {
		return function() {
			analytics.ga.recordEvent( 'Site-Indicator', action );
		};
	},

	errorAccessing: function() {
		let accessFailedMessage;

		// Don't show the button if the site is not defined.
		if ( this.props.site ) {
			accessFailedMessage = <span>{ this.translate( 'This site cannot be accessed.' ) } <DisconnectJetpackButton site={ this.props.site } text={ this.translate( 'Disconnect Site' ) } redirect="/sites" /></span>;
		} else {
			accessFailedMessage = <span>{ this.translate( 'This site cannot be accessed.' ) }</span>;
		}
		return accessFailedMessage;
	},

	errorUpdating: function() {
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

	getText: function() {
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

	render: function() {
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
			return <ProgressIndicator key="update-progress" status={ progressStatus } className="site-indicator__progress-indicator" />;
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
				<button className="site-indicator__button" onClick={ this.toggleExpand } />
				{ this.state.expand
					? <div className="site-indicator__message">
						<div className={ textClass }>
							{ this.getText() }
						</div>
					</div>
					: null }
			</div>
		);
	}
} );
