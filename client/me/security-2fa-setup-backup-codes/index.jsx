/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-setup-backup-codes' );

/**
 * Internal dependencies
 */
var SimpleNotice = require( 'notices/simple-notice' ),
	Security2faBackupCodesList = require( 'me/security-2fa-backup-codes-list' ),
	Security2faProgress = require( 'me/security-2fa-progress' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {

	displayName: 'Security2faSetupBackupCodes',

	mixins: [ eventRecorder ],

	propTypes: {
		onFinished: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	onFinished: function() {
		this.props.onFinished();
	},

	possiblyRenderError: function() {
		var errorMessage;
		if ( twoStepAuthorization.getBackupCodes().length ) {
			return;
		}

		errorMessage = this.translate(
			'There was an error retrieving back up codes. Please {{supportLink}}contact support{{/supportLink}}',
			{
				components: {
					supportLink: (
						<a
							href="https://support.wordpress.com/contact/"
							onClick={ this.recordClickEvent( 'No Backup Codes Contact Support Link' ) }
						/>
					)
				}
			}
		);

		return (
			<SimpleNotice
				isCompact
				showDismiss={ false }
				status="is-error"
				text={ errorMessage }
			/>
		);
	},

	renderList: function() {
		var backupCodes = twoStepAuthorization.getBackupCodes();

		// This shouldn't happen. If we've enabled 2fa, there should be backup codes.
		if ( ! backupCodes.length ) {
			return;
		}

		return (
			<Security2faBackupCodesList
				backupCodes={ backupCodes }
				onNextStep={ this.onFinished }
				showList
			/>
		);
	},

	render: function() {
		return (
			<div>
				<Security2faProgress step={ 3 } />
				<p>
					{
						this.translate(
							'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							'machine and the bag of rice trick doesn\'t work.'
						)
					}
				</p>

				{ this.possiblyRenderError() }
				{ this.renderList() }
			</div>
		);
	}
} );
