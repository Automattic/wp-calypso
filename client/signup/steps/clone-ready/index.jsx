/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import { getSiteBySlug } from 'state/sites/selectors';
import SignupActions from 'lib/signup/actions';

class CloneReadyStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	goToNextStep = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {} );

		console.log(
			'this is where we would start the alternate restore with the following payload:',
			this.props.payload
		);

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="clone-ready__card">
				<img
					alt="upgrade"
					className="clone-ready__image"
					src="/calypso/images/upgrades/thank-you.svg"
				/>
				<p className="clone-ready__description">
					{ translate(
						"Your server credentials worked like a charm! All that's left is to " +
							'initiate the cloning process.'
					) }
				</p>
				<p className="clone-ready__description">
					{ translate(
						'Any content on %(destinationSiteName)s, where you want to clone your content, ' +
							'will be overridden. Is this okay?'
					) }
				</p>
				<Button primary className="clone-ready__button" onClick={ this.goToNextStep }>
					{ translate( 'Yep! Begin cloning' ) }
				</Button>
			</Card>
		);
	};

	render() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			originSiteName,
			translate,
		} = this.props;

		const headerText = translate( 'Ready to clone!' );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ '' }
				fallbackSubHeaderText={ '' }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		destinationSiteName: get( ownProps, [ 'signupDependencies', 'destinationSiteName' ] ),
		payload: get( ownProps, [ 'signupDependencies' ], {} ),
	};
}, null )( localize( CloneReadyStep ) );
