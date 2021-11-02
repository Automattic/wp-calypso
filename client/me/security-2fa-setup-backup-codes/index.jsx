import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import Security2faBackupCodesList from 'calypso/me/security-2fa-backup-codes-list';
import Security2faProgress from 'calypso/me/security-2fa-progress';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

class Security2faSetupBackupCodes extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		backupCodes: PropTypes.array.isRequired,
	};

	getClickHandler = ( action ) => {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	onFinished = () => {
		this.props.onFinished();
	};

	renderError() {
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
		const { backupCodes } = this.props;
		if ( ! backupCodes || backupCodes.length === 0 ) {
			return this.renderError();
		}

		return (
			<Security2faBackupCodesList
				backupCodes={ backupCodes }
				onNextStep={ this.onFinished }
				showList
			/>
		);
	}

	render() {
		return (
			<div>
				<Security2faProgress step={ 3 } isSmsFlow={ this.props.isSmsFlow } />
				<p>
					{ this.props.translate(
						'Backup codes let you access your account if your phone is ' +
							'lost, stolen, or if you run it through the washing ' +
							"machine and the bag of rice trick doesn't work."
					) }
				</p>

				{ this.renderList() }
			</div>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( Security2faSetupBackupCodes ) );
