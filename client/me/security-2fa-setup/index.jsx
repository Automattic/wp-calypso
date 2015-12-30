/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa:setup' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	Security2faEnable = require( 'me/security-2fa-enable' ),
	Security2faSetupBackupCodes = require( 'me/security-2fa-setup-backup-codes' ),
	Security2faSMSSettings = require( 'me/security-2fa-sms-settings' ),
	Security2faInitialSetup = require( 'me/security-2fa-initial-setup' ),
	successNotice = require( 'state/notices/actions' ).successNotice;

const Security2faSetup = React.createClass( {

	displayName: 'Security2faSetup',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		return {
			step: 'initial-setup'
		};
	},

	propTypes: {
		onFinished: React.PropTypes.func.isRequired
	},

	onCancelSetup: function( event ) {
		event.preventDefault();
		this.setState( { step: 'initial-setup' } );
	},

	onInitialSetupSuccess: function() {
		this.setState( { step: 'sms-settings' } );
	},

	onSetupSuccess: function() {
		this.setState( { step: 'backup-codes' } );
	},

	onFinished: function() {
		this.props.successNotice( this.translate( 'Successfully enabled Two-Step Authentication.' ) );
		this.props.onFinished();
	},

	onVerifyByApp: function() {
		this.setState( { step: 'app-based' } );
	},

	onVerifyBySMS: function() {
		this.setState( { step: 'sms-based' } );
	},

	render: function() {
		return (
			<div className="security-2fa-setup__steps-container">
				{
					'initial-setup' === this.state.step
					? <Security2faInitialSetup onSuccess={ this.onInitialSetupSuccess } />
					: null
				}

				{
					'sms-settings' === this.state.step
					? (
						<Security2faSMSSettings
							userSettings={ this.props.userSettings }
							onCancel={ this.onCancelSetup }
							onVerifyByApp={ this.onVerifyByApp }
							onVerifyBySMS={ this.onVerifyBySMS }
						/>
					)
					: null
				}

				{
					'app-based' === this.state.step
					? (
						<Security2faEnable
							doSMSFlow={ false }
							onCancel={ this.onCancelSetup }
							onSuccess={ this.onSetupSuccess }
							userSettings={ this.props.userSettings }
						/>
					)
					: null
				}

				{
					'sms-based' === this.state.step
					? (
						<Security2faEnable
							doSMSFlow
							onCancel={ this.onCancelSetup }
							onSuccess={ this.onSetupSuccess }
							userSettings={ this.props.userSettings }
						/>
					)
					: null
				}

				{
					'backup-codes' === this.state.step
					? <Security2faSetupBackupCodes onFinished={ this.onFinished } />
					: null
				}
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( Security2faSetup );
