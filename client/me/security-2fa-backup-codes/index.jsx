/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-backup-codes' );

/**
 * Internal dependencies
 */
var Security2faBackupCodesPrompt = require( 'me/security-2fa-backup-codes-prompt' );

module.exports = React.createClass( {

	displayName: 'Security2faBackupCodes',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		var printed = this.props.userSettings.getSetting( 'two_step_backup_codes_printed' );

		return {
			printed: printed,
			verified: printed,
			showPrompt: ! printed
		};
	},

	onGenerate: function() {
		this.setState(
			{
				verified: false,
				showPrompt: true
			}
		);
	},

	onNextStep: function() {
		this.setState(
			{
				printed: true,
				verified: false,
				showPrompt: true
			}
		);
	},

	onVerified: function() {
		this.setState(
			{
				printed: true,
				verified: true,
				showPrompt: false
			}
		);
	},

	renderStatus: function() {
		if ( ! this.state.printed ) {
			return (
				this.translate(
					'{{status}}Status:{{/status}} Backup Codes have {{notVerified}}not been verified{{/notVerified}}.',
					{
						components: {
							status: <span className="security-2fa-backup-codes__status-heading"/>,
							notVerified: <span className="security-2fa-backup-codes__status-not-verified"/>
						}
					}
				)
			);
		}

		if ( ! this.state.verified ) {
			return (
				this.translate(
					'{{verify}}Backup Codes have just been printed, but need to be verified. ' +
					'Please enter one of them below for verification.{{/verify}}',
					{
						components: {
							verify: <span className="security-2fa-backup-codes__status-need-verification"/>,
						}
					}
				)
			);
		}

		return (
			this.translate(
				'{{status}}Status:{{/status}} Backup Codes have been {{verified}}verified{{/verified}}.',
				{
					components: {
						status: <span className="security-2fa-backup-codes__status-heading"/>,
						verified: <span className="security-2fa-backup-codes__status-verified"/>
					}
				}
			)
		);
	},

	render: function() {
		return (
			<div>
				<p>
					{
						this.translate(
							'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							'machine and the bag of rice trick doesn\'t work.'
						)
					}
				</p>

				<p className="security-2fa-backup-codes__status">{ this.renderStatus() }</p>

				{ this.state.showPrompt ? <Security2faBackupCodesPrompt onSuccess={ this.onVerified }/> : null }
			</div>
		);
	}
} );
