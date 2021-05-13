/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';
import HelpButton from './help-button';
import JetpackInstallStep from './install-step';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import MainWrapper from './main-wrapper';
import { addCalypsoEnvQueryArg } from './utils';
import { confirmJetpackInstallStatus } from 'calypso/state/jetpack-connect/actions';
import { externalRedirect } from 'calypso/lib/route';
import { getConnectingSite } from 'calypso/state/jetpack-connect/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { REMOTE_PATH_ACTIVATE, REMOTE_PATH_INSTALL } from './constants';

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

		externalRedirect( addCalypsoEnvQueryArg( remoteSiteUrl + REMOTE_PATH_INSTALL ) );
	};

	activateJetpack = () => {
		const { remoteSiteUrl } = this.props;

		this.props.recordTracksEvent( 'calypso_jpc_instructions_click', {
			jetpack_funnel: remoteSiteUrl,
			type: 'activate_jetpack',
		} );

		externalRedirect( addCalypsoEnvQueryArg( remoteSiteUrl + REMOTE_PATH_ACTIVATE ) );
	};

	renderLocaleSuggestions() {
		if ( this.props.isLoggedIn || ! this.props.locale ) {
			return;
		}

		return <LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />;
	}

	render() {
		const { jetpackVersion, remoteSiteUrl } = this.props;
		const instructionsData = this.getInstructionsData();

		return (
			<MainWrapper isWide>
				{ this.renderLocaleSuggestions() }
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
									jetpackVersion={ jetpackVersion }
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
			jetpackVersion: remoteSiteData.jetpackVersion || false,
			notJetpack,
		};
	},
	{
		confirmJetpackInstallStatus,
		recordTracksEvent,
	}
);

export default flowRight( connectComponent, localize )( InstallInstructions );
