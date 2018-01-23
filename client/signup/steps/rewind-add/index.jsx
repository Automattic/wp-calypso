/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';

class RewindAddStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	addCredentials = () => this.props.goToStep( 'rewind-form' );

	skipStep = () => this.props.goToNextStep();

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="rewind-add__card">
				<h3 className="rewind-add__title">{ translate( 'Add credentials' ) }</h3>
				<img className="rewind-add__image" src="/calypso/images/illustrations/security.svg" />
				<p className="rewind-add__description">
					{ translate(
						'By adding your site credentials, you are giving WordPress.com access to perform' +
							'automatic actions on your server including backing up your site, restoring your' +
							'site, as well as manually accessing your site in case of an emergency.'
					) }
				</p>
				<Button primary onClick={ this.addCredentials }>
					{ translate( 'Add credentials' ) }
				</Button>
			</Card>
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
			/>
		);
	}
}

export default localize( RewindAddStep );
