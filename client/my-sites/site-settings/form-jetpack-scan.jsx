/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings:security:scan' );

/**
 * Internal dependencies
 */
var formBase = require( 'my-sites/site-settings/form-base' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	Card = require( 'components/card' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormInput = require( 'components/forms/form-text-input' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormPasswordInput = require( 'components/forms/form-password-input' ),
	Dialog = require( 'components/dialog' ),
	ProgressIndicator = require( 'components/progress-indicator' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	notices = require( 'notices' ),
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );

module.exports = React.createClass( {

	displayName: 'SiteSettingsFormJetpackScan',

	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

	settingsTimer: false,

	getSshSettings: function( site ) {
		site = site || this.props.site;
		if ( ! this.state.sshSettingsFetched ) {
			this.setState( { fetchingSsh: true } );
			// Getting the user's existing SSH credentials
			site.fetchSshCredentials( function( error, data ) {
				if ( error ) {
					debug( 'Error fetching SSH creds', error );
					this.setState( { needsCreds: true } );
				}
				this.setSshSettings( data );
				this.setState( {
					sshSettingsFetched: true
				} );
			}.bind( this ) );
		}
	},

	setSshSettings: function( data ) {
		data = data || [];
		this.setState( {
			enabled: data.active || false,
			hostname: data.hostname || this.props.site.slug,
			port: data.port || '22',
			username: data.username || '',
			passwordUsed: data.password_used || false,
			credentialsPending: data.check_pending || false,
			credentialsValid: data.is_valid || false,
			editing: data.is_valid ? false : true,
			publicKeyString: data.public_key || false,
			lastScanned: data.last_scanned || false,
			fetchingSsh: false
		} );

		// Checking again in 5 seconds if the credentials have not yet been checked by the server
		if ( this.state.credentialsPending && this.state.enabled ) {
			this.settingsTimer = setTimeout( function() {
				this.setState( { sshSettingsFetched: false } );
				debug( 're-checking credentials' );
				this.getSshSettings();
			}.bind( this ), 5000 );
		} else {
			// remove the timer if necessary
			if ( typeof this.settingsTimer === 'number' ) {
				debug( 'credentials have been validated' );
				clearTimeout( this.settingsTimer );
			}

			debug( 'timer disabled', this.state );
			if ( ! this.state.credentialsValid && this.state.showValidationErrors ) {
				this.setState( { showValidationErrors: false } );
				notices.error(
					this.translate(
						'We are unable to connect to your server using these credentials. Please make sure they are correct, and {{a}}contact us{{/a}} if you are still having trouble.',
						{
							components: {
								a: <a href="http://jetpack.me/contact-support/" target="_blank" />
							}
						}
					)
				);
			}
		}
	},

	getSettingsFromSite: function( site ) {
		var settings = {};
		site = site || this.props.site;
		settings.fetchingSettings = site.fetchingSettings;
		settings.sshSettingsFetched = false;
		return settings;
	},

	resetState: function() {
		this.replaceState( {
			togglingModule: false,
			enabled: false,
			passwordUsed: false,
			editing: true,
			sshSettingsFetched: false
		} );
	},

	sshConnectionError: function() {
		if ( ! this.state.sshConnectionError ) {
			return null;
		}

		return (
			<p>
				{ this.translate(
					'There was a problem getting your SSH information from our server. Please refresh the page. If the problem persists, {{a}}please contact support{{/a}}.',
					{ components: { a: <a href="http://jetpack.me/contact-support/" target="_blank" /> } }
				) }
			</p>
		);
	},

	prompt: function() {
		if ( this.state.enabled || this.state.sshConnectionError ) {
			return null;
		}

		return (
			<div className="site-settings__jetpack-prompt">
				<img src="/calypso/images/jetpack/illustration-jetpack-scan.svg" width="128" height="128" />

				<div className="site-settings__jetpack-prompt-text">
					<p>{ this.translate( 'Scan your WordPress site for known security threats.' ) }</p>
					<p>{ this.translate( 'By allowing Jetpack Scan to access your site via SSH, you enable us to scan your server for security threats. As soon as we encounter potentially malicious code, we will alert you by email.' ) }</p>
				</div>
			</div>
		);
	},

	handleClick: function() {
		if ( ! this.disableForm() ) {
			this.setState( { showValidationErrors: false } );
		}
	},

	lastScanned: function() {
		var dateObject = new Date( this.state.lastScanned );
		if ( Object.prototype.toString.call( dateObject ) !== '[object Date]' ) {
			return null;
		}
		if ( isNaN( dateObject.getTime() ) ) {
			return null;
		}
		return (
			<p>
				{ this.translate( '{{strong}}Last Scanned{{/strong}}: %(date)s',
					{
						args: { date: this.moment( this.state.lastScanned ).calendar() },
						components: { strong: <strong /> }
					}
				) }
			</p>
		);
	},

	success: function() {
		return (
			<div>
				<p>
					{ this.translate(
						'Jetpack Scan is currently configured to scan for threats on %(host)s. If any vulnerabilities are found, you will be emailed at your {{a}}WordPress.com email address{{/a}}.',
						{
							args: { host: this.state.hostname },
							components: { a: <a href="/me/account" onClick={ this.recordEvent.bind( this, 'Clicked on Scan Link to WordPress.com Email Address' ) } />}
						}
					) }
				</p>
				{ this.lastScanned() }
			</div>
		);
	},

	inputErrorClass: function( property ) {
		if ( ! this.state.showValidationErrors ) {
			return null;
		}

		if ( ! this.state[ property ] ) {
			return 'is-error';
		}

		return null;
	},

	inputErrorMessage: function( property ) {
		if ( ! this.state.showValidationErrors ) {
			return null;
		}

		if ( ! this.state[ property ] ) {
			return <FormInputValidation isError text={ this.translate( 'This field is required.' ) } />;
		}

		return null;
	},

	sshCredentialsForm: function() {
		var footerContents = '';

		if ( ! this.state.enabled || this.state.sshConnectionError ) {
			return null;
		}

		if ( this.state.enabled && this.state.credentialsValid && ! this.state.editing ) {
			return this.success();
		}

		return (
			<form id="jetpack-scan-settings" onChange={ this.markChanged } onSubmit={ this.onSubmit }>
				<p>{ this.translate(
					'Please enter SSH login credentials for your web server. ' +
					'Jetpack Scan will look for known threats and alert you in case it finds anything.'
				) }</p>
				<FormLabel htmlFor="jetpack_scan_hostname">
					{ this.translate( 'Hostname', { context: 'Security scan credentials parameter, e.g. example.com' } ) }
				</FormLabel>
				<FormInput
					name="jetpack_scan_hostname"
					id="jetpack_scan_hostname"
					valueLink={ this.linkState( 'hostname' ) }
					onClick={ this.handleClick }
					disabled={ this.disableForm() }
					className={ this.inputErrorClass( 'hostname' ) } />
				<FormSettingExplanation>
					{ this.translate( 'The full hostname of your server. May be different from your domain name.' ) }
				</FormSettingExplanation>
				{ this.inputErrorMessage( 'hostname' ) }

				<FormLabel htmlFor="jetpack_scan_port">
					{ this.translate( 'Port', { context: 'Security scan credentials parameter, e.g. 22' } ) }
				</FormLabel>
				<FormInput
					name="jetpack_scan_port"
					id="jetpack_scan_port"
					valueLink={ this.linkState( 'port' ) }
					onClick={ this.handleClick }
					disabled={ this.disableForm() } />
				<FormSettingExplanation>
					{ this.translate( 'Unless you connect to a special port, this will be \'22\'.' ) }
				</FormSettingExplanation>

				<FormLabel htmlFor="jetpack_scan_username">
					{ this.translate( 'Username', { context: 'Security scan credentials parameter, e.g. someuser' } ) }
				</FormLabel>
				<FormInput
					name="jetpack_scan_username"
					id="jetpack_scan_username"
					valueLink={ this.linkState( 'username' ) }
					onClick={ this.handleClick }
					disabled={ this.disableForm() }
					className={ this.inputErrorClass( 'username' ) }/>
				<FormSettingExplanation>
					{ this.translate( 'User with SSH file access to your website\'s files.' ) }
				</FormSettingExplanation>
				{ this.inputErrorMessage( 'username' ) }

				<FormLabel htmlFor="jetpack_scan_password">
					{ this.translate( 'Password', { context: 'Security scan credentials parameter, e.g. mystrongpass' } ) }
				</FormLabel>
				<FormPasswordInput
					name="jetpack_scan_password"
					id="jetpack_scan_password"
					valueLink={ this.linkState( 'password' ) }
					disabled={ this.disableForm() } />

				<FormSettingExplanation>
					{ this.translate(
						'Password is not required if you use public key authentication. {{a}}Get your public key string.{{/a}}',
						{ components: { a: <a onClick={ this._onShowDialog } href="#" /> } }
					) }
				</FormSettingExplanation>
				{ footerContents }
			</form>
		);
	},

	toggleScan: function( event ) {
		var enable;
		event.preventDefault();
		notices.clearNotices( 'notices' );
		this.setState( {
			togglingModule: true,
			showValidationErrors: false
		} );

		if ( this.state.enabled ) {
			this.recordEvent.bind( this, 'Clicked disable Jetpack Scan button' );
			enable = false;
		} else {
			this.recordEvent.bind( this, 'Clicked enable Jetpack Scan button' );
			enable = true;
			this.setState( { needsCreds: true } );
		}

		if ( this.state.needsCreds ) {
			this.setState( {
				enabled: enable,
				submittingForm: false,
				togglingModule: false
			} );
		} else {
			this.props.site.toggleSshScan(
				{ active: enable },
				this.handleResponse
			);
		}
	},

	editSettings: function( event ) {
		event.preventDefault();
		this.setState( { editing: true } );
	},

	_onShowDialog: function( event ) {
		event.preventDefault();
		this.setState( { showDialog: true } );
	},

	_onCloseDialog: function( ) {
		this.setState( { showDialog: false } );
	},

	// updates the state when the server responds
	handleResponse: function( error, data ) {
		this.setState( {
			submittingForm: false,
			togglingModule: false
		} );
		this.markSaved();
		if ( error ) {
			debug( 'An error has occurred when processing SSH credentials', error );
			notices.error( this.translate( 'We could not activate Jetpack Scan for your site.' ) );
		} else {
			this.setSshSettings( data );
			debug( 'Updated settings on server', data );
		}
	},

	onSubmit: function( event ) {
		event.preventDefault();
		this.setState( { showValidationErrors: true } );

		if ( this.validateData() ) {
			this.processData();
		}
	},

	onCancelButton: function() {
		this.setState( { editing: false } );

		if ( ! this.credentialsValid ) {
			this.toggleScan();
		}
	},

	validateData: function() {
		return ( this.state.hostname && this.state.username );
	},

	processData: function() {
		this.setState( {
			submittingForm: true,
			credentialsPending: true,
			credentialsValid: false
		} );
		notices.clearNotices( 'notices' );
		this.props.site.updateSshCredentials(
			{
				hostname: this.state.hostname,
				port: this.state.port || '22',
				username: this.state.username,
				password: this.state.password,
				scanner_enabled: this.state.enabled ? 1 : 0
			},
			this.handleResponse
		);
	},

	publicKeyDialog: function() {
		var buttons = [
			{
				action: 'cancel',
				label: this.translate( 'OK' )
			}
		];

		return (
			<Dialog isVisible={ this.state.showDialog } buttons={ buttons } onClose={ this._onCloseDialog }>
				<div className="public-key__dialog-wrapper">
					<div className="public-key__dialog-header">
						<h1 className="public-key__dialog-title">
							{ this.translate( 'Your public key string.' ) }
						</h1>
					</div>
					<p>
						{
							this.translate(
								'Add the following string to the {{code}}~/.ssh/authorized_keys{{/code}} file on your server to enable public key authentication for the Jetpack Scan.',
								{
									components: { code: <code /> }
								}
							)
						}
					</p>
					<p>
						<FormInput
							valueLink={ this.linkState( 'publicKeyString' ) }
							selectOnFocus="true"
							readOnly="readonly" />
					</p>
				</div>
			</Dialog>
		);
	},

	disableForm: function() {
		return this.state.fetchingSettings || this.state.submittingForm || this.props.site.fetchingModules || this.state.togglingModule || this.state.fetchingSsh || ( this.state.enabled && this.state.credentialsPending );
	},

	showActivateButton: function() {
		if ( ! this.state.enabled ) {
			return (
				<Button
					compact
					primary
					disabled={ this.disableForm() }
					onClick={ this.toggleScan }
					>
					{ this.state.togglingModule ? this.translate( 'Activating…' ) : this.translate( 'Activate' ) }
				</Button>
			);
		}
	},

	showDeactivateButtons: function() {
		if ( this.state.enabled && this.state.credentialsValid && ! this.state.editing ) {
			return (
				<div>
					<Button
						compact
						disabled={ this.disableForm() }
						className="jetpack-scan__deactivate"
						onClick={ this.toggleScan }
						>
						{ this.state.togglingModule ? this.translate( 'Deactivating…' ) : this.translate( 'Deactivate' ) }
					</Button>

					<Button
						compact
						disabled={ this.disableForm() }
						onClick={ this.editSettings }
						className="jetpack-protect__edit-settings"
						>
						{ this.translate( 'Edit Settings' ) }
					</Button>
				</div>
			);
		}
	},

	showSaveSettingsButtons: function() {
		if ( ! this.state.credentialsPending && this.state.editing ) {
			return (
				<div>
					<Button
						className="jetpack-scan__deactivate"
						compact
						disabled={ this.disableForm() }
						onClick={ this.onCancelButton }
						>
						{ this.translate( 'Cancel' ) }
					</Button>
					<Button
						primary
						compact
						disabled={ this.disableForm() }
						onClick={ this.onSubmit }
						>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				</div>
			);
		}
	},

	showLoadingIndicator: function() {
		if ( this.state.credentialsPending ) {
			return (
				<div>
					<ProgressIndicator key="update-progress" status="processing" className="site-settings__progress-indicator" />
				</div>
			);
		}
	},

	render: function() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Jetpack Scan' ) }>
					{ this.showActivateButton() }
					{ this.showDeactivateButtons() }
					{ this.showSaveSettingsButtons() }
					{ this.showLoadingIndicator() }
				</SectionHeader>
				<Card className="jetpack-protect-settings">
					{ this.sshConnectionError() }
					{ this.sshCredentialsForm() }
					{ this.publicKeyDialog() }
					{ this.prompt() }
				</Card>
			</div>
		);
	}
} );
