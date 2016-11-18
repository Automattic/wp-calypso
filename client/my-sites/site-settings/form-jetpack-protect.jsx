/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings:security:protect' );

/**
 * Internal dependencies
 */
var formBase = require( './form-base' ),
	Card = require( 'components/card' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormLegend = require( 'components/forms/form-legend' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );
import { protectForm } from 'lib/protect-form';

module.exports = protectForm( React.createClass( {

	displayName: 'SiteSettingsFormJetpackProtect',

	mixins: [ dirtyLinkedState, formBase ],

	getSettingsFromSite: function( site ) {
		var settings = {};

		site = site || this.props.site;
		settings.fetchingSettings = site.fetchingSettings;

		if ( site.settings && site.settings.jetpack_protect_whitelist ) {
			settings.whitelistString = site.settings.jetpack_protect_whitelist.local.join( '\n' );
		}

		return settings;
	},

	resetState: function() {
		this.replaceState( {
			whitelistString: null,
			togglingModule: false,
			fetchingSettings: false
		} );
	},

	getIP: function() {
		if ( window.app && window.app.clientIp ) {
			return window.app.clientIp;
		}

		return this.translate( 'Unknown IP address' );
	},

	prompt: function() {
		return (
			<div className="site-settings__jetpack-prompt">
				<img src="/calypso/images/jetpack/illustration-jetpack-protect.svg" width="128" height="128" />

				<div className="site-settings__jetpack-prompt-text">
					<p>{ this.translate( 'Prevent brute force login attempts on your WordPress site.' ) }</p>
					<p>
						{ this.translate(
							'Brute force attacks are one of the most common (and successful) ways that attackers gain access to your site. ' +
							"When you activate Jetpack Protect, we'll automatically prevent malicious attempts to log into your site, but allow you to ensure you can always log in."
						) }
					</p>
				</div>
			</div>
		);
	},

	getModuleStatus: function( site ) {
		site = site || this.props.site;
		site.verifyModulesActive( [ 'protect' ], ( function( error, moduleStatus ) {
			if ( ! error ) {
				debug( 'Received jetpack protect module status', this.state );
				this.setState( { enabled: moduleStatus } );
			} else {
				debug( 'error getting module status', error );
			}
		} ).bind( this ) );
	},

	settings: function() {
		return (
			<form id="protect-settings" onChange={ this.props.markChanged } onSubmit={ this.handleSubmitForm }>
				<FormLegend>{ this.translate( 'IP Address Whitelist' ) }</FormLegend>

				<FormLabel>
					<p>{ this.translate( 'Whitelisting an IP address means that you will always be able to log in from that address. Enter one IP address or range per line.' ) }</p>
					<p>{ this.translate( 'Your current IP address is {{strong}}%(IP)s{{/strong}}.', { args: { IP: this.getIP() }, components: { strong: <strong /> } } ) }</p>
					<FormTextarea
						onFocus={ this.recordEvent.bind( this, 'Focused on Jetpack Protect whitelist' ) }
						name="jetpack_protect_whitelist_string"
						id="jetpack_protect_whitelist_string"
						valueLink={ this.linkState( 'whitelistString' ) }
						disabled={
							! this.state.enabled || this.disableForm()
						}
						placeholder={ this.translate( 'Example: 12.12.12.1-12.12.12.100' ) } />
				</FormLabel>

				<FormSettingExplanation>
						{ this.translate( 'IPv4 and IPv6 are acceptable. To specify a range, enter the low value and high value separated by a dash.' ) }
				</FormSettingExplanation>
			</form>
		);
	},

	// updates the state when an error occurs
	handleError: function() {
		this.setState( { submittingForm: false } );
		this.props.markSaved();
	},

	disableForm: function() {
		return this.state.fetchingSettings || this.state.submittingForm || this.props.site.fetchingModules || this.state.togglingModule;
	},

	deactivateFormButtons: function() {
		return(
			<div>
				<Button
					compact
					disabled={ this.disableForm() }
					className="jetpack-protect__deactivate"
					onClick={ this.toggleJetpackModule.bind( this, 'protect' ) }
					>
					{ this.state.togglingModule ? this.translate( 'Deactivating…' ) : this.translate( 'Deactivate' ) }
				</Button>
				<Button
					disabled={ this.disableForm() }
					compact
					primary
					onClick={ this.handleSubmitForm }
					>
					{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
				</Button>
			</div>
		);
	},

	activateFormButtons: function() {
		return(
			<Button
				onClick={ this.toggleJetpackModule.bind( this, 'protect' ) }
				disabled={ this.disableForm() }
				primary
				compact
				>
				{ this.state.togglingModule ? this.translate( 'Activating…' ) : this.translate( 'Activate' ) }
			</Button>
		);
	},

	render: function() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Jetpack Protect' ) }>
					{ this.state.enabled
						? this.deactivateFormButtons()
						: this.activateFormButtons()

					}
				</SectionHeader>
				<Card className="jetpack-protect-settings">
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
