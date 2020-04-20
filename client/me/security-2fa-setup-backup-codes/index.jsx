/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import Security2faBackupCodesList from 'me/security-2fa-backup-codes-list';
import Security2faProgress from 'me/security-2fa-progress';
import { CALYPSO_CONTACT } from 'lib/url/support';
import twoStepAuthorization from 'lib/two-step-authorization';
import { recordGoogleEvent } from 'state/analytics/actions';

class Security2faSetupBackupCodes extends React.Component {
	state = {
		backupCodes: [],
		lastError: false,
	};

	static propTypes = {
		onFinished: PropTypes.func.isRequired,
	};

	componentDidMount() {
		twoStepAuthorization.backupCodes( this.onRequestComplete );
	}

	getClickHandler = ( action ) => {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	onRequestComplete = ( error, data ) => {
		if ( error ) {
			this.setState( {
				lastError: this.props.translate( 'Unable to obtain backup codes. Please try again later.' ),
			} );
			return;
		}

		this.setState( {
			backupCodes: data.codes,
		} );
	};

	onFinished = () => {
		this.props.onFinished();
	};

	possiblyRenderError() {
		if ( ! this.state.lastError ) {
			return;
		}

		const errorMessage = this.props.translate(
			'There was an error retrieving back up codes. Please {{supportLink}}contact support{{/supportLink}}',
			{
				components: {
					supportLink: (
						<a
							href={ CALYPSO_CONTACT }
							onClick={ this.getClickHandler( 'No Backup Codes Contact Support Link' ) }
						/>
					),
				},
			}
		);

		return <Notice showDismiss={ false } status="is-error" text={ errorMessage } />;
	}

	renderList() {
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
	}

	render() {
		return (
			<div>
				<Security2faProgress step={ 3 } />
				<p>
					{ this.props.translate(
						'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							"machine and the bag of rice trick doesn't work."
					) }
				</p>

				{ this.possiblyRenderError() }
				{ this.renderList() }
			</div>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( Security2faSetupBackupCodes ) );
