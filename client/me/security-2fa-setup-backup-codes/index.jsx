/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-setup-backup-codes' );

/**
 * Internal dependencies
 */
var Security2faBackupCodesList = require( 'me/security-2fa-backup-codes-list' ),
	Security2faProgress = require( 'me/security-2fa-progress' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	eventRecorder = require( 'me/event-recorder' ),
	support = require( 'lib/url/support' );

import Notice from 'components/notice';

module.exports = React.createClass( {

	displayName: 'Security2faSetupBackupCodes',

	mixins: [ eventRecorder ],

	propTypes: {
		onFinished: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		twoStepAuthorization.backupCodes( this.onRequestComplete );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		return {
			backupCodes: [],
			lastError: false
		};
	},

	onRequestComplete: function( error, data ) {
		if ( error ) {
			this.setState( {
				lastError: this.translate( 'Unable to obtain backup codes.  Please try again later.' ),
			} );
			return;
		}

		this.setState( {
			backupCodes: data.codes,
		} );
	},

	onFinished: function() {
		this.props.onFinished();
	},

	possiblyRenderError: function() {
		var errorMessage;
		if ( ! this.state.lastError ) {
			return;
		}

		errorMessage = this.translate(
			'There was an error retrieving back up codes. Please {{supportLink}}contact support{{/supportLink}}',
			{
				components: {
					supportLink: (
						<a
							href={ support.CALYPSO_CONTACT }
							onClick={ this.recordClickEvent( 'No Backup Codes Contact Support Link' ) }
						/>
					)
				}
			}
		);

		return (
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ errorMessage }
			/>
		);
	},

	renderList: function() {
		if ( this.state.lastError ) {
			return null;
		}

		return (
			<Security2faBackupCodesList
				backupCodes={ this.state.backupCodes }
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
