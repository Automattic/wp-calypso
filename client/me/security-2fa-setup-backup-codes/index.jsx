/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

import { localize } from 'i18n-calypso';

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-setup-backup-codes' );

/**
 * Internal dependencies
 */
import Security2faBackupCodesList from 'me/security-2fa-backup-codes-list';

import Security2faProgress from 'me/security-2fa-progress';
import twoStepAuthorization from 'lib/two-step-authorization';
import eventRecorder from 'me/event-recorder';
import support from 'lib/url/support';

import Notice from 'components/notice';

export default localize( React.createClass( {

	displayName: 'Security2faSetupBackupCodes',

	mixins: [ eventRecorder ],

	propTypes: {
		onFinished: PropTypes.func.isRequired
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
				lastError: this.props.translate( 'Unable to obtain backup codes.  Please try again later.' ),
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
		let errorMessage;
		if ( ! this.state.lastError ) {
			return;
		}

		errorMessage = this.props.translate(
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
						this.props.translate(
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
} ) );
