/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings:security:monitor' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	Card = require( 'components/card' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormLabel = require( 'components/forms/form-label' ),
	formBase = require( './form-base' ),
	notices = require( 'notices' ),
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );
import { protectForm } from 'lib/protect-form';

module.exports = protectForm( React.createClass( {

	displayName: 'SiteSettingsFormJetpackMonitor',

	mixins: [ dirtyLinkedState, formBase ],

	getSettingsFromSite: function( site ) {
		var settings = {};

		site = site || this.props.site;
		settings.fetchingSettings = site.fetchingSettings;

		return settings;
	},

	resetState: function() {
		this.replaceState( {
			togglingModule: false,
			emailNotifications: false,
			wpNoteNotifications: false
		} );
	},

	getModuleStatus: function( site ) {
		site = site || this.props.site;

		site.fetchMonitorSettings( ( function( error, data ) {
			if ( ! error ) {
				this.setState( {
					emailNotifications: data.settings.email_notifications,
					wpNoteNotifications: data.settings.wp_note_notifications
				} );
			} else {
				debug( 'error getting Monitor settings', error );
			}
		} ).bind( this ) );

		site.verifyModulesActive( [ 'monitor' ], ( function( error, moduleStatus ) {
			if ( ! error ) {
				this.setState( { enabled: moduleStatus } );
			} else {
				debug( 'error getting module status', error );
			}
		} ).bind( this ) );
	},

	prompt: function() {
		return (
			<div className="site-settings__jetpack-prompt">
				<img src="/calypso/images/jetpack/illustration-jetpack-monitor.svg" width="128" height="128" />

				<div className="site-settings__jetpack-prompt-text">
					<p>{ this.translate( "Automatically monitor your website and make sure it's online." ) }</p>
					<p>
						{ this.translate(
							"We'll periodically check your site from our global network of servers to make sure it's online, and email you if it looks like your site is not responding for any reason."
						) }
					</p>
				</div>

			</div>
		);
	},

	saveSettings: function() {
		this.setState( { submitingForm: true } );
		notices.clearNotices( 'notices' );
		this.props.site.updateMonitorSettings( this.state.emailNotifications, this.state.wpNoteNotifications, ( function( error ) {
			if ( error ) {
				this.handleError();
				notices.error( this.translate( 'There was a problem saving your changes. Please, try again.' ) );
				return;
			}
			notices.success( this.translate( 'Settings saved successfully!' ) );
			this.props.markSaved();
			this.setState( { submittingForm: false } );
		} ).bind( this ) );
	},

	settings: function() {
		return (
			<div>
				<p>{ this.translate( "Jetpack is currently monitoring your site's uptime." ) }</p>
				{ this.settingsMonitorEmailCheckbox() }
				{ config.isEnabled( 'settings/security/monitor/wp-note' ) ? this.settingsMonitorWpNoteCheckbox() : '' }
			</div>
		);
	},

	settingsMonitorEmailCheckbox: function() {
		return (
			<FormLabel>
				<FormCheckbox
					disabled={ this.disableForm() }
					onClick={ this.recordEvent.bind( this, 'Clicked on Monitor email checkbox' ) }
					id="jetpack_monitor_email"
					checkedLink={ this.linkState( 'emailNotifications' ) }
					name="jetpack_monitor_email" />
				<span>
					{ this.translate( 'Send notifications to your {{a}}WordPress.com email address{{/a}}.', {
						components: {
							a: <a href="/me/account" onClick={ this.recordEvent.bind( this, 'Clicked on Monitor Link to WordPress.com Email Address' ) } />
						}
					} ) }
				</span>
			</FormLabel>
		);
	},

	settingsMonitorWpNoteCheckbox: function() {
		return (
				<FormLabel>
					<FormCheckbox
						disabled={ this.disableForm() }
						onClick={ this.recordEvent.bind( this, 'Clicked on Monitor wp-note checkbox' ) }
						id="jetpack_monitor_wp_note"
						checkedLink={ this.linkState( 'wpNoteNotifications' ) }
						name="jetpack_monitor_wp_note" />
					<span>
						{ this.translate( 'Send notifications via WordPress.com notification.' ) }
					</span>
				</FormLabel>
		);
	},

	// updates the state when an error occurs
	handleError: function() {
		this.setState( { submittingForm: false, togglingModule: false } );
		this.props.markSaved();
	},

	disableForm: function() {
		return this.state.fetchingSettings || this.state.submittingForm || this.props.site.fetchingModules || this.state.togglingModule;
	},

	activateFormButtons: function() {
		return(
			<Button
				compact
				primary
				onClick={ this.toggleJetpackModule.bind( this, 'monitor' ) }
				disabled={ this.disableForm() }
				>
				{ this.state.togglingModule ? this.translate( 'Activating…' ) : this.translate( 'Activate' ) }
			</Button>
		);
	},

	deactivateFormButtons: function() {
		return(
			<div>
				<Button
					compact
					className="jetpack-monitor__deactivate"
					onClick={ this.toggleJetpackModule.bind( this, 'monitor' ) }
					>
					{ this.state.togglingModule ? this.translate( 'Deactivating…' ) : this.translate( 'Deactivate' ) }
				</Button>
				<Button
					compact
					primary
					onClick={ this.saveSettings }
					>
					{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
				</Button>
			</div>
		);
	},

	render: function() {
		if ( ! config.isEnabled( 'settings/security/monitor' ) ) {
			return null;
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'Jetpack Monitor' ) }>
					{ this.state.enabled
						? this.deactivateFormButtons()
						: this.activateFormButtons()

					}
				</SectionHeader>
				<Card className="jetpack-monitor-settings">
					{
						this.state.enabled
						? this.settings()
						: this.prompt()
					}
				</Card>
			</div>

		);
	}

} ) );
