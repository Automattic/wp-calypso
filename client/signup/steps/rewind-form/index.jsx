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
import Popover from 'components/popover';
import SignupActions from 'lib/signup/actions';
import { getJetpackCredentials, getJetpackCredentialsUpdateStatus } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

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

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );
	storePopoverLink = ref => ( this.popoverLink = ref );

	renderStepContent = () => {
		const { happychatEvent, siteId, translate } = this.props;

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
								allowCancel: true,
								onCancel: this.onCancel,
								onComplete: this.props.goToNextStep,
							} }
						/>
					</div>
				</Card>
				<CompactCard className="rewind-form__help">
					<Button
						className="rewind-form__help-button"
						borderless={ true }
						onClick={ this.togglePopover }
						ref={ this.storePopoverLink }
					>
						<Gridicon icon="help" size={ 18 } />
						{ translate( "Need help finding your site's server credentials?" ) }
					</Button>
					<Popover
						context={ this.popoverLink }
						isVisible={ this.state.showPopover }
						onClose={ this.togglePopover }
						className="rewind-form__help-popover"
						position="top"
					>
						<div>{ translate( 'You can normally get your' ) }</div>
						<div>{ translate( 'credentials from your hosting' ) }</div>
						<div>{ translate( 'provider. Their website should' ) }</div>
						<div>{ translate( 'explain how to get or create the' ) }</div>
						<div>{ translate( 'credentials you need.' ) }</div>
					</Popover>
					<HappychatButton className="rewind-form__happychat-button" onClick={ happychatEvent }>
						<Gridicon icon="chat" size={ 24 } />
						{ translate( 'Get help' ) }
					</HappychatButton>
				</CompactCard>
			</div>
		);
	};

	componentWillReceiveProps( nextProps ) {
		if ( 'pending' === this.props.updateStatus && 'success' === nextProps.updateStatus ) {
			this.goToComplete();
		}
	}

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

const mapStateToProps = ( state, ownProps ) => {
	const siteId = parseInt( get( ownProps, [ 'initialContext', 'query', 'blogid' ], 0 ) );
	const mainCredentials = getJetpackCredentials( state, siteId, 'main' );

	return {
		siteId,
		mainCredentials,
		updateStatus: getJetpackCredentialsUpdateStatus( state, siteId ),
	};
};

const mapDispatchToProps = () => ( {
	happychatEvent: () => recordTracksEvent( 'calypso_signup_rewindcreds_form_get_help' ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( RewindFormStep ) );
