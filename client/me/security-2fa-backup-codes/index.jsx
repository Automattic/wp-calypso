/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import twoStepAuthorization from 'lib/two-step-authorization';
import eventRecorder from 'me/event-recorder';
import Security2faBackupCodesList from 'me/security-2fa-backup-codes-list';
import Security2faBackupCodesPrompt from 'me/security-2fa-backup-codes-prompt';

const debug = debugFactory( 'calypso:me:security:2fa-backup-codes' );

export default localize( React.createClass( {

	displayName: 'Security2faBackupCodes',

	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	getInitialState: function() {
		const printed = this.props.userSettings.getSetting( 'two_step_backup_codes_printed' );

		return {
			printed: printed,
			verified: printed,
			showPrompt: ! printed,
			backupCodes: [],
			generatingCodes: false
		};
	},

	onGenerate: function() {
		this.setState( {
			generatingCodes: true,
			verified: false,
			showPrompt: true
		} );

		twoStepAuthorization.backupCodes( this.onRequestComplete );
	},

	onRequestComplete: function( error, data ) {
		if ( error ) {
			this.setState( {
				lastError: this.props.translate( 'Unable to obtain backup codes.  Please try again later.' )
			} );
			return;
		}

		this.setState( {
			backupCodes: data.codes,
			generatingCodes: false
		} );
	},

	onNextStep: function() {
		this.setState( {
			backupCodes: [],
			printed: true,
		} );
	},

	onVerified: function() {
		this.setState( {
			printed: true,
			verified: true,
			showPrompt: false
		} );
	},

	renderStatus: function() {
		if ( ! this.state.printed ) {
			return (
			    <Notice
					isCompact
					status="is-error"
					text={ this.props.translate( 'Backup codes have not been verified.' ) }
				/>
			);
		}

		if ( ! this.state.verified ) {
			return (
			    <Notice
					isCompact
					text={ this.props.translate(
						'New backup codes have just been generated, but need to be verified.'
					) }
				/>
			);
		}

		return (
		    <Notice
				isCompact
				status="is-success"
				text={ this.props.translate( 'Backup codes have been verified' ) }
			/>
		);
	},

	renderList: function() {
		return (
			<Security2faBackupCodesList
				backupCodes={ this.state.backupCodes }
				onNextStep={ this.onNextStep }
				userSettings={ this.props.userSettings }
				showList
			/>
		);
	},

	renderPrompt: function() {
		return (
		    <div>
				<p>
					{
						this.props.translate(
							'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							'machine and the bag of rice trick doesn\'t work.'
						)
					}
				</p>

				{ this.renderStatus() }

				{ this.state.showPrompt &&
					<Security2faBackupCodesPrompt onSuccess={ this.onVerified } />
				}
			</div>
		);
	},

	render: function() {
		return (
		    <div className="security-2fa-backup-codes">
				<SectionHeader label={ this.props.translate( 'Backup Codes' ) }>
					<Button
						compact
						disabled={ this.state.generatingCodes || !! this.state.backupCodes.length }
						onClick={ this.recordClickEvent( 'Generate New Backup Codes Button', this.onGenerate ) }
					>
						{ this.props.translate( 'Generate New Backup Codes' ) }
					</Button>
				</SectionHeader>
				<Card>
					{
						this.state.generatingCodes || this.state.backupCodes.length
						? this.renderList()
						: this.renderPrompt()
					}
				</Card>
			</div>
		);
	}
} ) );
