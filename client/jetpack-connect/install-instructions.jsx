import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { confirmJetpackInstallStatus } from 'calypso/state/jetpack-connect/actions';
import { getConnectingSite } from 'calypso/state/jetpack-connect/selectors';
import { REMOTE_PATH_ACTIVATE, REMOTE_PATH_INSTALL } from './constants';
import HelpButton from './help-button';
import JetpackInstallStep from './install-step';
import MainWrapper from './main-wrapper';
import { addCalypsoEnvQueryArg } from './utils';

class InstallInstructions extends Component {
	static propTypes = {
		remoteSiteUrl: PropTypes.string.isRequired,
	};

	getInstructionsData() {
		const { notJetpack, translate } = this.props;

		return {
			headerTitle: notJetpack
				? translate( 'Ready for installation' )
				: translate( 'Ready for activation' ),
			headerSubtitle: translate( "We'll need you to complete a few manual steps." ),
			steps: notJetpack
				? [ 'installJetpack', 'activateJetpackAfterInstall', 'connectJetpackAfterInstall' ]
				: [ 'activateJetpack', 'connectJetpack' ],
			buttonOnClick: notJetpack ? this.installJetpack : this.activateJetpack,
			buttonText: notJetpack ? translate( 'Install Jetpack' ) : translate( 'Activate Jetpack' ),
		};
	}

	installJetpack = () => {
		const { remoteSiteUrl } = this.props;

		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: remoteSiteUrl,
			type: 'install_jetpack',
		} );

		navigate( addCalypsoEnvQueryArg( remoteSiteUrl + REMOTE_PATH_INSTALL ) );
	};

	activateJetpack = () => {
		const { remoteSiteUrl } = this.props;

		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: remoteSiteUrl,
			type: 'activate_jetpack',
		} );

		navigate( addCalypsoEnvQueryArg( remoteSiteUrl + REMOTE_PATH_ACTIVATE ) );
	};

	render() {
		const { remoteSiteUrl } = this.props;
		const instructionsData = this.getInstructionsData();

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__install">
					<FormattedHeader
						headerText={ instructionsData.headerTitle }
						subHeaderText={ instructionsData.headerSubtitle }
					/>
					<div className="jetpack-connect__install-steps">
						{ instructionsData.steps.map( ( stepName, key ) => {
							return (
								<JetpackInstallStep
									key={ 'instructions-step-' + key }
									stepName={ stepName }
									currentUrl={ remoteSiteUrl }
									confirmJetpackInstallStatus={ this.props.confirmJetpackInstallStatus }
									onClick={ instructionsData.buttonOnClick }
								/>
							);
						} ) }
					</div>
					<Button onClick={ instructionsData.buttonOnClick } primary>
						{ instructionsData.buttonText }
					</Button>
				</div>
				<LoggedOutFormLinks>
					<HelpButton />
				</LoggedOutFormLinks>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const remoteSite = getConnectingSite( state );
		const remoteSiteData = remoteSite.data || {};
		let notJetpack = ! remoteSiteData.hasJetpack;

		const { installConfirmedByUser } = remoteSite;
		if ( installConfirmedByUser === false ) {
			notJetpack = true;
		}
		if ( installConfirmedByUser === true ) {
			notJetpack = false;
		}

		return {
			notJetpack,
		};
	},
	{
		confirmJetpackInstallStatus,
		recordTracksEvent,
	}
);

export default connectComponent( localize( InstallInstructions ) );
