/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:two-step' );

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	Card = require( 'components/card' ),
	AppPasswords = require( 'me/application-passwords' ),
	Security2faBackupCodes = require( 'me/security-2fa-backup-codes' ),
	Security2faDisable = require( 'me/security-2fa-disable' ),
	Security2faSetup = require( 'me/security-2fa-setup' ),
	ReauthRequired = require( 'me/reauth-required' ),
	Security2faDisable = require( 'me/security-2fa-disable' ),
	Security2faSetup = require( 'me/security-2fa-setup' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	SecuritySectionNav = require( 'me/security-section-nav' ),
	Main = require( 'components/main' );

module.exports = React.createClass( {

	displayName: 'TwoStep',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		this.props.userSettings.on( 'change', this.onUserSettingsChange );
		this.props.userSettings.fetchSettings();
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
		this.props.userSettings.off( 'change', this.onUserSettingsChange );
	},

	getInitialState: function() {
		return {
			initialized: false,
			doingSetup: false
		};
	},

	onUserSettingsChange: function() {
		if ( ! this.isMounted() ) {
			return;
		}

		if ( ! this.state.initialized ) {
			this.setState( {
				initialized: true,
				doingSetup: ! this.props.userSettings.isTwoStepEnabled()
			} );
			return;
		}

		// are we doing setup? don't re-render during the setup flow
		if ( this.state.doingSetup ) {
			return;
		}

		this.forceUpdate();
	},

	onSetupFinished: function() {
		this.setState(
			{
				doingSetup: false
			},
			this.refetchSettings
		);
	},

	onDisableFinished: function() {
		this.setState(
			{
				doingSetup: true
			},
			this.refetchSettings
		);
	},

	refetchSettings: function() {
		this.props.userSettings.fetchSettings();
	},

	renderPlaceholders: function() {
		var i,
			placeholders = [];

		for ( i = 0; i < 5; i++ ) {
			placeholders.push( <p className="two-step__placeholder-text" key={ '2fa-placeholder' + i } > &nbsp; </p> );
		}

		return placeholders;
	},

	renderTwoStepSection: function() {
		if ( ! this.state.initialized ) {
			return this.renderPlaceholders();
		}

		if ( this.state.doingSetup ) {
			return (
				<Security2faSetup
					userSettings={ this.props.userSettings }
					onFinished={ this.onSetupFinished }
				/>
			);
		}

		return (
			<Security2faDisable
				userSettings={ this.props.userSettings }
				onFinished={ this.onDisableFinished }
			/>
		);
	},

	renderApplicationPasswords: function() {
		if ( ! this.state.initialized || this.state.doingSetup ) {
			return null;
		}

		return (
			<AppPasswords appPasswordsData={ this.props.appPasswordsData } />
		);
	},

	renderBackupCodes: function() {
		if ( ! this.state.initialized || this.state.doingSetup ) {
			return null;
		}

		return (
			<Security2faBackupCodes userSettings={ this.props.userSettings } />
		);
	},

	render: function() {
		return (
			<Main className="two-step">
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card>
					{ this.renderTwoStepSection() }
				</Card>

				{ this.renderBackupCodes() }
				{ this.renderApplicationPasswords() }
			</Main>
		);
	}
} );
