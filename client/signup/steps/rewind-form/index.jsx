/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import HappychatButton from 'components/happychat/button';
import RewindCredentialsForm from 'components/rewind-credentials-form';
import SignupActions from 'lib/signup/actions';
import { getJetpackCredentials } from 'state/selectors';

class RewindFormStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	state = {
		showPopover: false,
	};

	skipStep = () => this.props.goToNextStep();

	onCancel = () => this.props.goToStep( 'rewind-confirm' );

	goToComplete = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Setting up your site' ),
			stepName: this.props.stepName,
		} );

		this.props.goToNextStep();
	};

	togglePopover = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	renderStepContent = () => {
		const { siteId, translate } = this.props;

		return (
			<div className="rewind-form__container">
				<h3 className="rewind-form__title">{ translate( 'Site Credentials' ) }</h3>
				<p>
					{ translate(
						"We'll guide you through the process of getting and entering your site's credentials."
					) }
				</p>
				<CompactCard className="rewind-form__section-title">
					{ translate( 'Enter your credentials' ) }
				</CompactCard>
				<Card className="rewind-form__card">
					<div className="rewind-form__form">
						<RewindCredentialsForm
							{ ...{
								role: 'main',
								protocol: 'ssh',
								port: 22,
								siteId: siteId,
								showCancelButton: true,
								showDeleteButton: false,
								onCancel: this.onCancel,
								onComplete: this.props.goToNextStep,
							} }
						/>
					</div>
				</Card>
				<CompactCard className="rewind-form__help">
					<Button className="rewind-form__help-button">
						<Gridicon icon="help" size={ 18 } />
						{ translate( "Need help finding your site's server credentials?" ) }
					</Button>
					<HappychatButton className="rewind-form__happychat-button">
						<Gridicon icon="chat" size={ 24 } />
						{ translate( 'Get help' ) }
					</HappychatButton>
				</CompactCard>
			</div>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				skipLabelText="Skip"
				hideBack={ true }
				hideSkip={ true }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = parseInt( get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 ) );
	const mainCredentials = getJetpackCredentials( state, siteId, 'main' );

	return {
		siteId,
		mainCredentials,
	};
}, null )( localize( RewindFormStep ) );
