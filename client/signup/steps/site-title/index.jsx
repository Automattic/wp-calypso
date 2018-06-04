/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import SignupSiteTitle from 'components/signup-site-title';
import SiteTitleExample from 'components/site-title-example';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';

import { translate } from 'i18n-calypso';

class SiteTitleStep extends React.Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	submitSiteTitleStep = siteTitle => {
		this.props.setSiteTitle( siteTitle );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Setting up your site' ),
				stepName: this.props.stepName,
				siteTitle,
			},
			{ siteTitle }
		);

		this.props.goToNextStep();
	};

	skipStep = () => {
		this.submitSiteTitleStep( '' );
	};

	renderSiteTitleStep = () => {
		return (
			<div>
				<SignupSiteTitle onSubmit={ this.submitSiteTitleStep } />
				<SiteTitleExample />
			</div>
		);
	};

	render() {
		const headerText = translate( 'Give your new site a name.' );
		const subHeaderText = translate(
			'Enter a Site Title that will be displayed for visitors. You can always change this later.'
		);

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderSiteTitleStep() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
}

export default connect( null, { setSiteTitle } )( SiteTitleStep );
