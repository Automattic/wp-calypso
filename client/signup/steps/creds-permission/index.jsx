/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'calypso/signup/step-wrapper';
import { Card, Button } from '@automattic/components';
import QuerySites from 'calypso/components/data/query-sites';
import { autoConfigCredentials } from 'calypso/state/jetpack/credentials/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class CredsPermissionStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,
	};

	autoConfigCredentials = () =>
		this.props.autoConfigCredentials( this.props.initialContext.query.blogid );

	skipStep = () => this.props.goToNextStep();

	shareCredentials = () => {
		this.autoConfigCredentials();

		this.props.recordTracksEvent( 'calypso_pressable_nux_credentials_share', {} );
		this.props.submitSignupStep( { stepName: this.props.stepName }, { rewindconfig: true } );
		this.props.goToStep(
			'pressable-nux' === this.props.flowName ? 'creds-complete' : 'rewind-were-backing'
		);
	};

	renderStepContent() {
		const { translate } = this.props;

		return (
			<Card className="creds-permission__card">
				<QuerySites />
				<h3 className="creds-permission__title">{ translate( 'Start backing up your site' ) }</h3>
				<img
					className="creds-permission__image"
					src="/calypso/images/illustrations/security.svg"
					alt=""
				/>
				<p className="creds-permission__description">
					{ translate(
						'Jetpack, a plugin already on your site, can back up and secure your site at no ' +
							'extra cost to you thanks to our partnership with Pressable. To start backing up ' +
							"your site, we need the credentials for your site's server. Do you want to give " +
							"Jetpack access to your host's server to perform backups?"
					) }
				</p>
				<p className="creds-permission__description">
					{ translate(
						'By adding credentials, you are providing us with access to your server to perform automatic actions (such as backing up or restoring your site), manually access your site in case of an emergency, and troubleshoot your support requests.'
					) }
				</p>
				<Button primary onClick={ this.shareCredentials }>
					{ translate( 'Share credentials' ) }
				</Button>
			</Card>
		);
	}

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				skipLabelText="Skip"
				hideBack={ true }
			/>
		);
	}
}

export default connect( null, {
	autoConfigCredentials,
	recordTracksEvent,
	submitSignupStep,
} )( localize( CredsPermissionStep ) );
