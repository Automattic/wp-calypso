import { CALYPSO_CONTACT } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { bumpTwoStepAuthMCStat } from 'calypso/lib/two-step-authorization';
import wp from 'calypso/lib/wp';
import Security2faBackupCodesList from 'calypso/me/security-2fa-backup-codes-list';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

class Security2faSetupBackupCodes extends Component {
	state = {
		backupCodes: [],
		lastError: false,
	};

	static propTypes = {
		onFinished: PropTypes.func.isRequired,
	};

	componentDidMount() {
		wp.req.post( '/me/two-step/backup-codes/new', ( error, data ) => {
			if ( ! error ) {
				bumpTwoStepAuthMCStat( 'new-backup-codes-success' );

				this.setState( {
					backupCodes: data.codes,
				} );
			} else {
				this.setState( {
					lastError: this.props.translate(
						'Unable to obtain backup codes. Please try again later.'
					),
				} );
			}
		} );
	}

	getClickHandler = ( action ) => {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
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
